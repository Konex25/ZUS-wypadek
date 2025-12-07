import { fileTable } from "@/db/schema";
import { analyzeFilesForCase } from "@/lib/analyser/analyzer";
import { database } from "@/lib/database/database";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  const analyzeResult = await analyzeFilesForCase(files);
  await database.insert(fileTable).values(analyzeResult);

  return NextResponse.json(analyzeResult);
}
