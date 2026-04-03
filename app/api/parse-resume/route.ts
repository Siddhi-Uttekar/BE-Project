import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resume = formData.get("resume") as File;

    if (!resume) {
      return NextResponse.json({ error: "No resume uploaded" }, { status: 400 });
    }

    const pdfParser = new (PDFParser as any)(null, true);
    const buffer = Buffer.from(await resume.arrayBuffer());

    return new Promise((resolve) => {
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF parsing error:", errData.parserError);
        resolve(
          NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
        );
      });

      pdfParser.on("pdfParser_dataReady", async () => {
        try {
          const text = (pdfParser as any).getRawTextContent();
          const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
          const prompt = `
      Extract the following information from the resume text:
      - name
      - email
      - phone
      - skills (as an array of strings)
      - experience (as a single string)
      - education (as a single string)
      - projects (as a single string)
      - achievements (as a single string)

      Return the information in a valid JSON object.

      Resume text:
      ${text}
      `;

          const result = await model.generateContent(prompt);
          const responseText = result?.response?.text() || "";

          let parsedData = {};
          const match = responseText.match(
            /\`\`\`json([\s\S]*?)\`\`\`|\s*(\{[\s\S]*\})/
          );
          if (match) {
            const jsonString = match[1] || match[2];
            parsedData = JSON.parse(jsonString);
          }
          resolve(NextResponse.json(parsedData));
        } catch (error) {
          console.error("Error generating content from Gemini:", error);
          resolve(
            NextResponse.json(
              { error: "Failed to extract information from resume" },
              { status: 500 }
            )
          );
        }
      });

      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error("Unhandled error in parse-resume:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
