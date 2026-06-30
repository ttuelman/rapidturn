import { NextRequest, NextResponse } from "next/server";
import { calculateQuote } from "@/lib/pricing";
import { validatePartSpec } from "@/lib/validation";
import type { PartSpec } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const spec = (await request.json()) as PartSpec;
    const validation = validatePartSpec(spec);

    if (!validation.valid) {
      return NextResponse.json({ valid: false, errors: validation.errors }, { status: 400 });
    }

    const quote = calculateQuote(spec);
    if (!quote) {
      return NextResponse.json(
        { valid: false, errors: ["Unable to calculate quote"] },
        { status: 400 },
      );
    }

    return NextResponse.json({ valid: true, quote });
  } catch {
    return NextResponse.json({ valid: false, errors: ["Invalid request"] }, { status: 400 });
  }
}
