import { z } from "zod";
import { activitySchema, activityTypeSchema } from "./index";

// Body of POST /api/generate. This schema is never sent to the Claude API,
// so .min()/.max() are fine here (unlike the activity schemas).

export const MAX_REQUEST_LENGTH = 20_000;

/** Only the last few chat messages are sent with a refine request. */
export const MAX_HISTORY = 10;

export const generateRequestSchema = z
  .object({
    type: activityTypeSchema.describe("Which kind of activity to make."),
    request: z
      .string({ error: "Please type what you'd like to create." })
      .trim()
      .min(1, { error: "Please type what you'd like to create." })
      .max(MAX_REQUEST_LENGTH, {
        error: `Your request is too long. Please keep it under ${MAX_REQUEST_LENGTH.toLocaleString("en-US")} characters.`,
      }),
    history: z
      .array(
        z.object({
          role: z.enum(["teacher", "assistant"]),
          text: z.string().max(MAX_REQUEST_LENGTH),
        }),
      )
      .max(MAX_HISTORY)
      .default([]),
    current: activitySchema.nullable().default(null),
  })
  .refine((body) => body.current === null || body.current.type === body.type, {
    error: "The current activity doesn't match the chosen activity type. Please refresh and try again.",
    path: ["current"],
  });

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

const GENERIC_MESSAGE =
  "Something is wrong with this request. Please refresh the page and try again.";

/** Turns a validation error into one friendly sentence for the teacher. */
export function friendlyValidationMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return GENERIC_MESSAGE;

  const field = issue.path[0];
  if (field === "request") return issue.message;
  if (field === "type") return "Please choose an activity type.";
  if (field === "current" && issue.code === "custom") return issue.message;
  return GENERIC_MESSAGE;
}
