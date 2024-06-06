const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function chat(userInput) {
    try {
        const chatCompletion = await openai.chat.completions.create(
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful health mate AI assistant. You can only answer to health and habit related questions' },
                    { role: 'user', content: userInput }
                ],
                temperature: 1,
                max_tokens: 125,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }
        );

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('Error creating chat completion:', error);
        throw new Error('Failed to create chat completion');
    }
}

module.exports = { chat };