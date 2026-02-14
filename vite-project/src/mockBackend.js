/**
 * Mock AI Agent Backend
 * Simulates an AI agent with memory and calculation capabilities
 */

// In-memory storage for the agent's memory
const memory = {};

/**
 * Mock agent response function
 * Simulates network delay and processes various commands
 * 
 * @param {string} prompt - User's input message
 * @returns {Promise<Object>} Structured response object
 */
export async function mockAgentResponse(prompt) {
    // Simulate 1-second network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const lowerPrompt = prompt.toLowerCase().trim();

        // ========================================
        // MATH CALCULATIONS
        // ========================================
        // Pattern: "what is X plus/minus/times/divided by Y"
        const mathPatterns = [
            { regex: /what\s+is\s+(\d+)\s+(?:plus|add)\s+(\d+)/i, op: '+' },
            { regex: /(\d+)\s*\+\s*(\d+)/, op: '+' },
            { regex: /what\s+is\s+(\d+)\s+(?:minus|subtract)\s+(\d+)/i, op: '-' },
            { regex: /(\d+)\s*-\s*(\d+)/, op: '-' },
            { regex: /what\s+is\s+(\d+)\s+(?:times|multiplied\s+by)\s+(\d+)/i, op: '*' },
            { regex: /(\d+)\s*\*\s*(\d+)/, op: '*' },
            { regex: /what\s+is\s+(\d+)\s+divided\s+by\s+(\d+)/i, op: '/' },
            { regex: /(\d+)\s*\/\s*(\d+)/, op: '/' },
        ];

        for (const pattern of mathPatterns) {
            const match = lowerPrompt.match(pattern.regex);
            if (match) {
                const num1 = parseFloat(match[1]);
                const num2 = parseFloat(match[2]);
                let result;
                let operation;

                switch (pattern.op) {
                    case '+':
                        result = num1 + num2;
                        operation = 'addition';
                        break;
                    case '-':
                        result = num1 - num2;
                        operation = 'subtraction';
                        break;
                    case '*':
                        result = num1 * num2;
                        operation = 'multiplication';
                        break;
                    case '/':
                        result = num2 !== 0 ? num1 / num2 : 'undefined (division by zero)';
                        operation = 'division';
                        break;
                }

                return {
                    success: true,
                    type: 'calculation',
                    message: `The result of ${num1} ${pattern.op} ${num2} is ${result}.`,
                    data: { num1, num2, operation, result }
                };
            }
        }

        // ========================================
        // MEMORY SAVE COMMANDS
        // ========================================
        // Pattern: "remember [key] is [value]" or "my [key] is [value]"
        const savePatterns = [
            /remember\s+(?:my\s+)?(.+?)\s+is\s+(.+)/i,
            /my\s+(.+?)\s+is\s+(.+)/i,
            /save\s+(.+?)\s+as\s+(.+)/i,
        ];

        for (const pattern of savePatterns) {
            const match = prompt.match(pattern);
            if (match) {
                const key = match[1].trim().toLowerCase();
                const value = match[2].trim();

                memory[key] = value;

                return {
                    success: true,
                    type: 'memory_save',
                    message: `Got it! I'll remember that your ${key} is ${value}.`,
                    data: { key, value }
                };
            }
        }

        // ========================================
        // MEMORY RECALL COMMANDS
        // ========================================
        // Pattern: "what is my [key]" or "do you remember my [key]"
        const recallPatterns = [
            /what\s+is\s+my\s+(.+?)[\?]?$/i,
            /what'?s\s+my\s+(.+?)[\?]?$/i,
            /do\s+you\s+remember\s+my\s+(.+?)[\?]?$/i,
            /tell\s+me\s+my\s+(.+?)[\?]?$/i,
        ];

        for (const pattern of recallPatterns) {
            const match = prompt.match(pattern);
            if (match) {
                const key = match[1].trim().toLowerCase();

                if (memory[key]) {
                    return {
                        success: true,
                        type: 'memory_recall',
                        message: `Your ${key} is ${memory[key]}.`,
                        data: { key, value: memory[key] }
                    };
                } else {
                    return {
                        success: false,
                        type: 'memory_recall',
                        message: `I don't have any information about your ${key}. You haven't told me about it yet.`,
                        data: { key, found: false }
                    };
                }
            }
        }

        // ========================================
        // FALLBACK RESPONSE
        // ========================================
        return {
            success: true,
            type: 'general',
            message: "I'm a simple AI agent. I can help you with:\n• Math calculations (e.g., 'What is 10 plus 5?')\n• Remembering things (e.g., 'Remember my cat's name is Fluffy')\n• Recalling information (e.g., 'What is my cat's name?')",
            data: null
        };

    } catch (error) {
        // Error handling
        return {
            success: false,
            type: 'error',
            message: 'Sorry, I encountered an error processing your request. Please try again.',
            data: { error: error.message }
        };
    }
}
