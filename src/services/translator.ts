import axios from "axios";

interface TranslationResult {
    translatedText: string;
    significance: 'low' | 'medium' | 'high';
}

async function translateText(text: string): Promise<TranslationResult> {
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = '"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
    const prompt = `
          Translate the following Chinese text to English and evaluate its significance.
          The significance should be categorized as 'low', 'medium', or 'high' based on the following criteria:
          - How impactful the news is to the tech industry
          - How novel or groundbreaking the information is
          - The potential long-term implications of the news
          
          Text to translate and evaluate:
          "${text}"
          
          Respond in the following JSON format:
          {
            "translatedText": "[Your English translation here]",
            "significance": "[low/medium/high]",
            "explanation": "[Brief explanation of why you chose this significance level]"
          }
  `;

    try {
        const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
            contents: [{parts: [{text: prompt}]}]
        });

        const generatedContent = response.data.candidates[0].content.parts[0].text;
        const result = JSON.parse(generatedContent);

        return {
            translatedText: result.translatedText,
            significance: result.significance as 'low' | 'medium' | 'high'
        };
    } catch (error) {
        console.error('Error in translation and evaluation:', error);
        return {
            translatedText: text,
            significance: 'low' // default to medium if there's an error
        };
    }
}

export default translateText;
