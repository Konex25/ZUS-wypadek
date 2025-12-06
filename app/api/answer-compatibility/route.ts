import openai from "@/lib/openai/openai";
import { NextResponse } from "next/server";
import { ANSWER_COMPATIBILITY_PROMPT, SYSTEM_PROMPT } from "./prompt";

export async function POST(request: Request) {
  const { question, answer } = await request.json();

  if (!openai) {
    return NextResponse.json(
      { error: "OpenAI client not initialized" },
      { status: 500 }
    );
  }

  const response = await openai.responses.create({
    model: "gpt-5.1",
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: ANSWER_COMPATIBILITY_PROMPT(question, answer) },
    ],
  });

  const responseText = response.output_text || "";
  const parsedResponse = JSON.parse(responseText);

  return NextResponse.json(parsedResponse);
}
