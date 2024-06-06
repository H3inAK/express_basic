const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/generate', async (req, res) => {
  const prompt = req.body.prompt;

  const data = {
    "input": {
      "top_k": 0,
      "top_p": 1,
      "prompt": prompt,
      "temperature": 0.5,
      "system_prompt": "You are a knowledgeable and friendly virtual assistant named Health Mate, specializing in providing comprehensive guidance on habit formation, health tips, and wellness practices. Your goal is to help users develop and maintain healthy habits, offer accurate health advice, and support overall well-being. Please ensure that your responses are informative, empathetic, and easy to understand. Don't answer more than 1k tokens. Remember that! Don't provide anything if the questions are not related to mindfulness, healthy, habit tracking, and health. You have to answer for only health or habit related questions. If the message is a question, and the question is not related to health or habit, then you might have to say that \"Ohh Sorry! I am healthmate AI chat bot. I can only answer to health or habit related questions\". You don't have to provide any additional information. For greeting messages, respond appropriately as Health Mate.",
      "length_penalty": 1,
      "max_new_tokens": 500,
      "min_new_tokens": -1,
      "prompt_template": "<s>[INST] <<SYS>>\\n{system_prompt}\\n<</SYS>>\\n\\n{prompt} [/INST]",
      "presence_penalty": 0
    }
  };

  try {
    const response = await axios.post(
      'https://api.replicate.com/v1/models/meta/llama-2-70b-chat/predictions',
      data,
      {
        headers: {
          'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Poll for the result
    const resultUrl = response.data.urls.get;
    let result = await axios.get(resultUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
      }
    });

    while (result.data.status !== 'succeeded' && result.data.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      result = await axios.get(resultUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`
        }
      });
    }

    if (result.data.status === 'succeeded') {
      res.json({ message: result.data.output });
    } else {
      res.status(500).json({ error: 'Failed to generate response' });
    }
  } catch (error) {
    console.error('Error calling Replicate API:', error);
    res.status(500).json({ error: 'Error generating response' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
