const { BaseChatModel } = require('@langchain/core/language_models/chat_models');
const { AIMessage, SystemMessage, HumanMessage } = require('@langchain/core/messages');
const aiRouter = require('../services/aiRouter');

class FailoverChatModel extends BaseChatModel {
    constructor(fields = {}) {
        super(fields);
        this.userId = fields.userId;
        this.isPremiumUser = fields.isPremiumUser;
        this.featureType = fields.featureType || 'general';
        this.modelName = fields.modelName || 'gpt-4o-mini'; // For compatibility
    }

    _llmType() {
        return 'failover_chat_model';
    }

    /**
     * Main generation method
     */
    async _generate(messages, options) {
        // 1. Extract prompts
        let systemPrompt = '';
        let userPrompt = '';

        messages.forEach(msg => {
            if (msg instanceof SystemMessage) {
                systemPrompt += msg.content + '\n';
            } else if (msg instanceof HumanMessage) {
                userPrompt += msg.content + '\n';
            } else {
                // Fallback for other message types
                if (msg.role === 'system') systemPrompt += msg.content + '\n';
                else userPrompt += msg.content + '\n';
            }
        });

        // Clean up
        systemPrompt = systemPrompt.trim();
        userPrompt = userPrompt.trim();

        // 2. Metadata for router
        // Try to get userId from options/configurable if passed dynamically
        const userId = options?.configurable?.userId || this.userId;
        const isPremiumUser = options?.configurable?.isPremiumUser || this.isPremiumUser;

        const metadata = {
            userId,
            isPremiumUser,
            featureType: this.featureType,
            systemPrompt
        };

        try {
            // 3. Prepare AI Router Options
            const routerOptions = {
                max_tokens: options.max_tokens,
                response_format: options.response_format,
                temperature: options.temperature,
                model: options.model
            };

            // 4. Call Router
            const text = await aiRouter.generateText(userPrompt, metadata, routerOptions);

            // 5. Return formatted result
            return {
                generations: [
                    {
                        text: text,
                        message: new AIMessage(text)
                    }
                ]
            };
        } catch (error) {
            console.error('FailoverModel Error:', error);
            throw error;
        }
    }
}

module.exports = FailoverChatModel;
