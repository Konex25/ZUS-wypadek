import { NewCase, NewSubject } from "@/db/schema";
import { createFile } from "@/lib/services";
import { NextResponse } from "next/server";
import { v4 } from "uuid";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  const fileIds = await Promise.all(
    files.map(async (file) => createFile(file))
  );

  const nip = formData.get("nip");
  if (!nip) {
    return NextResponse.json({ error: "NIP is required" }, { status: 400 });
  }

  const newSubject: NewSubject = {
    id: v4(),
    nip: nip.toString(),
  };

  const newCase: NewCase = {
    id: v4(),
    status: "PENDING",
    subjectId: newSubject.id,

    createdAt: new Date(),
    updatedAt: new Date(),
    fileIds,
  };
}
