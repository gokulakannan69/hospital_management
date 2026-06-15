import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const chatWithAi = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });
    res.json({ reply: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: 'I encountered an error. Please check your API key and try again.' });
  }
};
