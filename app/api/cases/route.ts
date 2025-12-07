import { casesTable, NewCase, NewSubject } from "@/db/schema";
import { getCases } from "@/lib/database/cases";
import { database } from "@/lib/database/database";
import { createFile } from "@/lib/services";
import { NextResponse } from "next/server";
import { v4 } from "uuid";

export async function GET() {
  const cases = await getCases();

  return NextResponse.json(cases);
}

export async function POST(request: Request) {
  const formData = await request.json();

  const fileIds = formData.fileIds;
  if (!fileIds) {
    return NextResponse.json(
      { error: "File IDs are required" },
      { status: 400 }
    );
  }

  const newSubject: NewSubject = {
    id: v4(),
    nip: formData.nip,
  };

  const newCase: NewCase = {
    id: v4(),
    status: "PENDING",

    createdAt: new Date(),
    updatedAt: new Date(),

    fileIds,
  };

  await database.insert(casesTable).values(newCase).execute();
}
