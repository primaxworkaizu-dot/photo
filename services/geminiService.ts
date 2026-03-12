import { GoogleGenAI, Part } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTextFromImage = async (filePart: Part): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    filePart,
                    { text: "この画像に含まれるテキストをすべて文字起こししてください。レイアウトはできるだけ保持してください。" }
                ]
            }
        });
        return response.text || "テキストを抽出できませんでした。";
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("文字起こし中にエラーが発生しました。");
    }
};
