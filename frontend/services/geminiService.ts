import { GoogleGenAI } from "@google/genai";

const apiKey = (import.meta.env.VITE_GEMINI_API_KEY ?? '').trim();
let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!apiKey) return null;
  if (!ai) ai = new GoogleGenAI({ apiKey });
  return ai;
}

export const getCoachAdvice = async (userQuery: string) => {
  try {
    const client = getClient();
    if (!client) {
      return "Koç sohbeti için .env.local dosyasına VITE_GEMINI_API_KEY eklemen gerekiyor. Ekledikten sonra sunucuyu yeniden başlat (npm run dev).";
    }
    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: `Sen akademik ve teknik bir üretkenlik koçusun. 
        Kullanıcı 4. sınıf Bilgisayar Öğretmenliği öğrencisi ve Trainee.
        React, Java, ML ve ALES hedefleri var.
        Cevapların motivasyonel, teknik açıdan doğru ve kısa (maksimum 200 kelime) olmalı.
        Stresi azaltıcı, somut adımlar içeren öneriler ver.`,
        temperature: 0.7,
      },
    });
    const text = response.text ?? (response as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return text || 'Yanıt alınamadı.';
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Gemini API Error:', error);
    return `Bağlantı kurulamadı. Hata: ${message}. API anahtarını ve model erişimini kontrol et.`;
  }
};
