import { NewCase } from "@/db/schema";
import { getCases } from "@/lib/database/cases";
import { createFile } from "@/lib/services";
import { NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET() {
  const cases = await getCases();

  return NextResponse.json(cases);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  const fileIds = await Promise.all(
    files.map(async (file) => createFile(file))
  );

  const x: NewCase = {
    id: v4(),
    fileIds,
  };
}
