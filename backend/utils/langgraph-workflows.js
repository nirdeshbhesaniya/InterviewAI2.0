const { StateGraph, END } = require('@langchain/langgraph');
const { 
  createInterviewQAChain, 
  createAnswerChain,
  createMCQChain 
} = require('./langchain-chains');

// ============================================
// 1. INTERVIEW PREPARATION WORKFLOW
// ============================================
// This workflow handles the full interview prep cycle:
// Generate Q&A → Review → Regenerate if needed → Finalize

async function createInterviewPrepWorkflow() {
  // Define the state schema
  const InterviewState = {
    title: null,
    tag: null,
    experience: null,
    description: null,
    questions: [],
    currentQuestionIndex: 0,
    needsRegeneration: [],
    status: 'initial', // initial → generating → reviewing → complete
    error: null
  };

  const workflow = new StateGraph({
    channels: InterviewState
  });

  // Node 1: Generate initial Q&A
  workflow.addNode('generate_qa', async (state) => {
    try {
      const chain = await createInterviewQAChain();
      const result = await chain.invoke({
        title: state.title,
        tag: state.tag,
        experience: state.experience,
        numberOfQuestions: 5
      });

      return {
        ...state,
        questions: result.questions,
        status: 'generated'
      };
    } catch (error) {
      return {
        ...state,
        error: error.message,
        status: 'error'
      };
    }
  });

  // Node 2: Review questions (human-in-the-loop checkpoint)
  workflow.addNode('review', async (state) => {
    // This is where human review would happen
    // For now, automatically proceed
    return {
      ...state,
      status: 'reviewed'
    };
  });

  // Node 3: Regenerate specific answers if needed
  workflow.addNode('regenerate', async (state) => {
    if (state.needsRegeneration.length === 0) {
      return {
        ...state,
        status: 'complete'
      };
    }

    const chain = await createAnswerChain();
    const updatedQuestions = [...state.questions];

    for (const index of state.needsRegeneration) {
      if (updatedQuestions[index]) {
        const result = await chain.invoke({
          question: updatedQuestions[index].question,
          title: state.title,
          tag: state.tag,
          experience: state.experience
        });

        updatedQuestions[index].answer = result;
      }
    }

    return {
      ...state,
      questions: updatedQuestions,
      needsRegeneration: [],
      status: 'complete'
    };
  });

  // Define edges
  workflow.addEdge('__start__', 'generate_qa');
  workflow.addEdge('generate_qa', 'review');
  
  // Conditional edge: if needs regeneration, go to regenerate; otherwise end
  workflow.addConditionalEdges(
    'review',
    (state) => {
      if (state.needsRegeneration.length > 0) {
        return 'regenerate';
      }
      return END;
    },
    {
      regenerate: 'regenerate',
      [END]: END
    }
  );

  workflow.addEdge('regenerate', END);

  return workflow.compile();
}

// ============================================
// 2. MCQ GENERATION WORKFLOW
// ============================================
// This workflow generates MCQs with quality validation

async function createMCQWorkflow() {
  const MCQState = {
    topic: null,
    difficulty: 'medium',
    numberOfQuestions: 30,
    questions: [],
    validatedQuestions: [],
    invalidQuestions: [],
    status: 'initial',
    error: null
  };

  const workflow = new StateGraph({
    channels: MCQState
  });

  // Node 1: Generate MCQs
  workflow.addNode('generate_mcqs', async (state) => {
    try {
      const chain = await createMCQChain();
      const result = await chain.invoke({
        topic: state.topic,
        difficulty: state.difficulty,
        numberOfQuestions: state.numberOfQuestions
      });

      return {
        ...state,
        questions: result.questions,
        status: 'generated'
      };
    } catch (error) {
      return {
        ...state,
        error: error.message,
        status: 'error'
      };
    }
  });

  // Node 2: Validate questions
  workflow.addNode('validate', async (state) => {
    const validated = [];
    const invalid = [];

    for (const question of state.questions) {
      // Basic validation rules
      const isValid = 
        question.questionText &&
        question.options &&
        Object.keys(question.options).length === 4 &&
        question.correct &&
        question.explanation;

      if (isValid) {
        validated.push(question);
      } else {
        invalid.push(question);
      }
    }

    return {
      ...state,
      validatedQuestions: validated,
      invalidQuestions: invalid,
      status: 'validated'
    };
  });

  // Node 3: Regenerate invalid questions
  workflow.addNode('regenerate_invalid', async (state) => {
    if (state.invalidQuestions.length === 0) {
      return {
        ...state,
        status: 'complete'
      };
    }

    // Regenerate only the number of invalid questions
    const chain = await createMCQChain();
    const result = await chain.invoke({
      topic: state.topic,
      difficulty: state.difficulty,
      numberOfQuestions: state.invalidQuestions.length
    });

    return {
      ...state,
      validatedQuestions: [...state.validatedQuestions, ...result.questions],
      invalidQuestions: [],
      status: 'complete'
    };
  });

  // Define edges
  workflow.addEdge('__start__', 'generate_mcqs');
  workflow.addEdge('generate_mcqs', 'validate');
  
  workflow.addConditionalEdges(
    'validate',
    (state) => {
      if (state.invalidQuestions.length > 0) {
        return 'regenerate_invalid';
      }
      return END;
    },
    {
      regenerate_invalid: 'regenerate_invalid',
      [END]: END
    }
  );

  workflow.addEdge('regenerate_invalid', END);

  return workflow.compile();
}

// ============================================
// 3. ADAPTIVE INTERVIEW SESSION WORKFLOW
// ============================================
// Multi-stage interview with difficulty adaptation

async function createAdaptiveInterviewWorkflow() {
  const AdaptiveState = {
    userId: null,
    topic: null,
    currentDifficulty: 'medium',
    questionsAsked: [],
    correctAnswers: 0,
    totalAnswers: 0,
    currentQuestion: null,
    status: 'initial',
    performanceScore: 0
  };

  const workflow = new StateGraph({
    channels: AdaptiveState
  });

  // Node: Generate question based on current difficulty
  workflow.addNode('generate_question', async (state) => {
    const chain = await createInterviewQAChain();
    const result = await chain.invoke({
      title: state.topic,
      tag: 'technical',
      experience: state.currentDifficulty,
      numberOfQuestions: 1
    });

    return {
      ...state,
      currentQuestion: result.questions[0],
      status: 'question_ready'
    };
  });

  // Node: Evaluate answer and adjust difficulty
  workflow.addNode('evaluate_answer', async (state) => {
    // Calculate performance score
    const score = state.correctAnswers / Math.max(state.totalAnswers, 1);

    // Adjust difficulty based on performance
    let newDifficulty = state.currentDifficulty;
    if (score > 0.8 && state.currentDifficulty === 'medium') {
      newDifficulty = 'hard';
    } else if (score < 0.4 && state.currentDifficulty === 'medium') {
      newDifficulty = 'easy';
    }

    return {
      ...state,
      currentDifficulty: newDifficulty,
      performanceScore: score,
      status: 'evaluated'
    };
  });

  // Node: Check if session should continue
  workflow.addNode('check_continue', async (state) => {
    const shouldContinue = state.questionsAsked.length < 10;

    return {
      ...state,
      status: shouldContinue ? 'continue' : 'complete'
    };
  });

  // Define edges
  workflow.addEdge('__start__', 'generate_question');
  workflow.addEdge('generate_question', 'evaluate_answer');
  workflow.addEdge('evaluate_answer', 'check_continue');
  
  workflow.addConditionalEdges(
    'check_continue',
    (state) => {
      if (state.status === 'continue') {
        return 'generate_question';
      }
      return END;
    },
    {
      generate_question: 'generate_question',
      [END]: END
    }
  );

  return workflow.compile();
}

module.exports = {
  createInterviewPrepWorkflow,
  createMCQWorkflow,
  createAdaptiveInterviewWorkflow
};

