import { getCases } from "@/lib/db/cases";
import { NextResponse } from "next/server";

export async function GET() {
  const cases = await getCases();

  return NextResponse.json(cases);
}
