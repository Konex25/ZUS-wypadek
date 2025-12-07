import { getCaseById } from "@/lib/database/cases";
import { NextResponse } from "next/server";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = context.params;

  const caseData = await getCaseById(id);

  if (!caseData) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({ case: caseData });
}
