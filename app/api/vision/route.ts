import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const resultSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    diseaseName: {
      type: SchemaType.STRING,
      description: "Name of the crop disease in English",
    },
    diseaseNameHi: {
      type: SchemaType.STRING,
      description: "Name of the crop disease in Hindi",
    },
    confidence: {
      type: SchemaType.INTEGER,
      description: "Confidence percentage of the diagnosis (0-100)",
    },
    severity: {
      type: SchemaType.STRING,
      enum: ["low", "medium", "high"],
      format: "enum",
      description: "Severity of the disease",
    },
    treatment: {
      type: SchemaType.ARRAY,
      description: "Step-by-step treatment instructions",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          step: { type: SchemaType.STRING, description: "Treatment step in English" },
          stepHi: { type: SchemaType.STRING, description: "Treatment step in Hindi" },
        },
        required: ["step", "stepHi"],
      },
    },
    prevention: {
      type: SchemaType.ARRAY,
      description: "Prevention tips in the requested target language",
      items: {
        type: SchemaType.STRING,
      },
    },
  },
  required: ["diseaseName", "diseaseNameHi", "confidence", "severity", "treatment", "prevention"],
};

export async function POST(req: Request) {
  try {
    const { imageBase64, language } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: resultSchema,
      },
      systemInstruction: "You are a crop disease diagnosis AI. Analyze the provided crop image, identify the disease (if any), and provide a diagnosis in the exact JSON format requested. Provide the prevention tips primarily in the target user language: " + language,
    });

    const prompt = "Analyze this crop image and provide disease diagnosis.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const text = result.response.text();
    return Response.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini Vision API error:", error);
    return Response.json({ error: "Failed to fetch response from Gemini Vision API" }, { status: 500 });
  }
}
