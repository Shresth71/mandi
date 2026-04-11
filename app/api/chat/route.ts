import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { messages, language } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format chat history
    // Since KhetSenseScreen uses { role: 'user' | 'assistant', content: string }, we map it to Gemini's format:
    // { role: 'user' | 'model', parts: [{ text: string }] }
    
    // We append a system instruction as the very first message or by formatting the prompt if we want to ensure context.
    // However, Gemini Flash supports system instructions natively. Let's provide it in the system instruction config.
    const chatModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: language === 'hi' 
        ? "आप किसान कवच के AI कृषि सहायक 'खेत सेंस' हैं। खेती, मौसम, फसल रोग, और मंडी भाव से जुड़े सवालों के विशेषज्ञ के रूप में उत्तर दें। कृषकों के लिए सहायक, सम्मानजनक, और संक्षिप्त भाषा का उपयोग करें।"
        : "You are the Kisaan Kavach AI farming assistant 'KhetSense'. Answer questions regarding farming, weather, crop diseases, and market prices as an expert. Be helpful, respectful, and concise."
    });

    // Gemini strictly requires the first message to be from a 'user'
    const userStartIndex = messages.findIndex((m: any) => m.role === 'user');
    const validHistory = userStartIndex >= 0 ? messages.slice(userStartIndex, -1) : [];

    const chat = chatModel.startChat({
      history: validHistory.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    return Response.json({ response: responseText });
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json({ error: "Failed to fetch response from Gemini API" }, { status: 500 });
  }
}
