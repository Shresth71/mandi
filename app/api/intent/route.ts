import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const intentSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    action: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["home", "cropdoctor", "khetsense", "fairmandi", "weather", "autoclaim", "marketplace", "close", "unknown"],
      description: "The intended screen destination or action the user wants to perform."
    },
    response: {
      type: SchemaType.STRING,
      description: "A very short, friendly, and localized spoken reply acknowledging the action in the user's language."
    }
  },
  required: ["action", "response"]
};

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: intentSchema,
      },
      systemInstruction: `You are the KisaanKavach Voice Assistant engine. Determine the exact screen the user wants to navigate to based on their voice transcript. Provide a friendly conversational response in ${language}. If the transcript is nonsense or completely unrelated, select 'unknown'.`,
    });

    const result = await model.generateContent(text);
    const output = result.response.text();
    
    return NextResponse.json(JSON.parse(output));
  } catch (error) {
    console.error("Intent API error:", error);
    return NextResponse.json({ error: "Failed to parse intent." }, { status: 500 });
  }
}
