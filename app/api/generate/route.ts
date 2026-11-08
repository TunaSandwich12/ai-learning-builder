import { generateActivity } from "@/src/lib/ai/generate";
import { samples } from "@/src/lib/samples";
import {
  friendlyValidationMessage,
  generateRequestSchema,
} from "@/src/lib/schemas/generate-request";
import { createClient } from "@/src/lib/supabase/server";

// Real generation can take a while; allow up to 60 seconds.
export const maxDuration = 60;

const FAKE_DELAY_MS = 700;

function errorResponse(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

// Creates or edits an activity from the teacher's request.
// FAKE_MODE=true returns a saved sample; otherwise Claude generates it.
export async function POST(request: Request) {
  try {
    // 1. Teacher must be logged in. (proxy.ts only guards /dashboard, so check here.)
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims) {
      return errorResponse(401, "Please log in to create activities.");
    }

    // 2. Read and validate the body.
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "We couldn't read that request. Please try again.");
    }

    const parsed = generateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(400, friendlyValidationMessage(parsed.error));
    }
    const { type, current } = parsed.data;

    // 3. Fake mode: pretend to think, then return the sample for this type.
    //    When refining, return the current activity with a marked title instead.
    if (process.env.FAKE_MODE === "true") {
      await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));
      const content = current ? { ...current, title: `${current.title} (changed)` } : samples[type];
      return Response.json({ content });
    }

    // 4. Real generation with Claude.
    const result = await generateActivity(parsed.data);
    if (!result.ok) {
      return errorResponse(result.status, result.message);
    }
    return Response.json({ content: result.activity });
  } catch (error) {
    console.error("POST /api/generate failed:", error);
    return errorResponse(500, "Something went wrong. Please try again.");
  }
}
