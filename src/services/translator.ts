import axios from "axios";
import {GoogleGenerativeAI} from '@google/generative-ai';

interface TranslationResult {
    translatedText: string;
    significance: 'low' | 'medium' | 'high';
    translatedTitle: string;
}

async function translateText(text: string): Promise<TranslationResult> {
    const API_KEY = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(API_KEY!);

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {responseMimeType: "application/json"}
    })

    const prompt = `
    Translate and summarise the following Chinese text to English and evaluate its significance, also suggest english title.
    The significance should be categorized as 'low', 'medium', or 'high' based on the following criteria:
    - How impactful the news is to the tech industry
    - How novel or groundbreaking the information is
    - The potential long-term implications of the news

    Text to translate and evaluate:
    ${text}

    Respond in the following JSON format:
    {
      translatedText: [Your English translation here],
      significance: [low/medium/high],
      title: [suggested english title]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const bla = JSON.parse(result.response.text());
        const text = Array.isArray(bla.translatedText) ? bla.translatedText.join('\n') : bla.translatedText;
        const sign = Array.isArray(bla.significance) ? bla.significance.join('\n') : bla.significance;
        const title = Array.isArray(bla.title) ? bla.title.join('\n') : bla.title;

        return {
            translatedText: text,
            significance: sign as 'low' as 'low' | 'medium' | 'high',
            translatedTitle: title
        };
    } catch (error) {
        console.error('Error in translation and evaluation:', error, JSON.stringify({text}));
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', error.response?.data);
        }
        return {
            translatedText: '',
            significance: 'low', // default to medium if there's an error
            translatedTitle: ''
        };
    }
}

export default translateText;
