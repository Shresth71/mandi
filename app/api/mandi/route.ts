import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const resultSchema: Schema = {
  type: SchemaType.ARRAY,
  description: "An array of current agricultural commodity prices.",
  items: {
    type: SchemaType.OBJECT,
    properties: {
      id: { type: SchemaType.STRING },
      name: { type: SchemaType.STRING, description: "Crop name in English (e.g. Wheat, Rice, Tomato)" },
      nameHi: { type: SchemaType.STRING, description: "Crop name in Hindi" },
      price: { type: SchemaType.INTEGER, description: "Current price per unit in INR" },
      priceChange: { type: SchemaType.NUMBER, description: "Percentage change from yesterday, can be negative" },
      unit: { type: SchemaType.STRING, description: "Unit e.g., '/quintal' or '/kg'" },
      market: { type: SchemaType.STRING, description: "Name of the mandi strictly in English e.g., 'Dehradun'" },
      prediction: {
        type: SchemaType.STRING,
        format: "enum",
        enum: ["SELL", "HOLD", "BUY"]
      },
      history: {
        type: SchemaType.ARRAY,
        description: "5-day price history array strictly containing 5 objects representing Mon-Fri",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            day: { type: SchemaType.STRING, description: "Short day name e.g. Mon, Tue" },
            price: { type: SchemaType.INTEGER, description: "Historical price" }
          },
          required: ["day", "price"]
        }
      }
    },
    required: ["id", "name", "nameHi", "price", "priceChange", "unit", "market", "prediction", "history"]
  }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location') || 'Dehradun';
    const crops = searchParams.get('crops') || 'Wheat, Rice, Tomato, Potato, Onion, Sugarcane, Cotton, Maize, Mustard, Soybean, Chickpea, Groundnut';

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: resultSchema,
      },
      systemInstruction: "You are an Indian agricultural market statistics API. Return realistic, current estimation of crop prices for the requested location. Keep prices realistic for Indian markets (in INR). Ensure price changes correctly correlate with the history trajectory.",
    });

    const prompt = `Generate realistic current mandi prices for the following crops in ${location}: ${crops}. It is currently ${new Date().toDateString()}. Provide exact JSON string output obeying the schema.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Mandi API error:", error);
    return NextResponse.json({ error: "Failed to generate market predictions / check backend" }, { status: 500 });
  }
}
