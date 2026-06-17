import axiosInstance from '../utils/axiosInstance';

export const roadmapService = {
  // Fetch all roadmap progress for the user
  getAllProgress: async () => {
    try {
      const response = await axiosInstance.get('/roadmaps/progress');
      return response.data; // Array of progress objects
    } catch (error) {
      console.error('Error fetching all roadmap progress:', error);
      throw error;
    }
  },

  // Fetch progress for a specific roadmap
  getProgress: async (roadmapId) => {
    try {
      const response = await axiosInstance.get(`/roadmaps/progress/${roadmapId}`);
      return response.data; // Progress object
    } catch (error) {
      console.error(`Error fetching progress for roadmap ${roadmapId}:`, error);
      throw error;
    }
  },

  // Save/Update progress for a specific roadmap
  saveProgress: async (roadmapId, completedTopics, clearedModules = []) => {
    try {
      const response = await axiosInstance.post(`/roadmaps/progress/${roadmapId}`, {
        completedTopics,
        clearedModules
      });
      return response.data;
    } catch (error) {
      console.error(`Error saving progress for roadmap ${roadmapId}:`, error);
      throw error;
    }
  },

  // Generate assessment for a module
  generateAssessment: async (moduleTitle, topics) => {
    try {
      const response = await axiosInstance.post('/assessment/generate', { moduleTitle, topics });
      return response.data;
    } catch (error) {
      console.error('Error generating assessment:', error);
      throw error;
    }
  },

  // Evaluate user answers
  evaluateAssessment: async (questions, userAnswers) => {
    try {
      const response = await axiosInstance.post('/assessment/evaluate', { questions, userAnswers });
      return response.data;
    } catch (error) {
      console.error('Error evaluating assessment:', error);
      throw error;
    }
  }
};
