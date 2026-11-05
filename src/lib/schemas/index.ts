import { z } from "zod";

// NOTE: No .min(), .max(), .length() or regex here. The Claude API's structured
// outputs don't support them, so every rule is written into .describe() instead.

export const activityTypes = [
  "multiple_choice",
  "true_false",
  "flashcards",
  "matching",
  "ordering",
] as const;

export type ActivityType = (typeof activityTypes)[number];

export const activityTypeSchema = z.enum(activityTypes);

const base = {
  title: z
    .string()
    .describe("A short, student-friendly title for the activity, under 60 characters."),
  instructions: z
    .string()
    .describe(
      "One or two plain sentences telling the student what to do. Plain text only, no markdown or HTML.",
    ),
};

export const multipleChoiceSchema = z.object({
  type: z.literal("multiple_choice"),
  ...base,
  questions: z
    .array(
      z.object({
        question: z.string().describe("The question, written as a complete sentence."),
        options: z
          .array(
            z.object({
              text: z.string().describe("The answer option text."),
              isCorrect: z.boolean().describe("True only for the single correct option."),
            }),
          )
          .describe(
            "Exactly 4 options. Exactly one option has isCorrect true; the other 3 are plausible but wrong. Vary the position of the correct option across questions.",
          ),
        explanation: z
          .string()
          .describe("One or two sentences explaining why the correct option is right."),
      }),
    )
    .describe("Between 5 and 10 questions, with no duplicates."),
});

export const trueFalseSchema = z.object({
  type: z.literal("true_false"),
  ...base,
  statements: z
    .array(
      z.object({
        statement: z
          .string()
          .describe("A clear factual claim (not a question) that is either true or false."),
        isTrue: z.boolean().describe("Whether the statement is true."),
        explanation: z
          .string()
          .describe("One or two sentences explaining why the statement is true or false."),
      }),
    )
    .describe("Between 5 and 10 statements, roughly half true and half false."),
});

export const flashcardsSchema = z.object({
  type: z.literal("flashcards"),
  ...base,
  cards: z
    .array(
      z.object({
        front: z.string().describe("A term or short prompt."),
        back: z.string().describe("A concise definition or answer, under 25 words."),
      }),
    )
    .describe("Between 8 and 15 cards, each covering a different idea."),
});

export const matchingSchema = z.object({
  type: z.literal("matching"),
  ...base,
  pairs: z
    .array(
      z.object({
        left: z.string().describe("An item on the left side, such as a term."),
        right: z.string().describe("The one item on the right that matches it."),
      }),
    )
    .describe(
      "Between 4 and 10 pairs. Every left and right value is unique, and each left matches exactly one right. List pairs already matched; do not shuffle, the app shuffles.",
    ),
});

export const orderingSchema = z.object({
  type: z.literal("ordering"),
  ...base,
  items: z
    .array(z.string().describe("One step or item."))
    .describe(
      "Between 4 and 8 items listed in the correct order, first to last. Each item has exactly one correct position. Do not shuffle; the app shuffles.",
    ),
});

export type MultipleChoiceActivity = z.infer<typeof multipleChoiceSchema>;
export type TrueFalseActivity = z.infer<typeof trueFalseSchema>;
export type FlashcardsActivity = z.infer<typeof flashcardsSchema>;
export type MatchingActivity = z.infer<typeof matchingSchema>;
export type OrderingActivity = z.infer<typeof orderingSchema>;

/** Per-type schemas. /api/generate sends schemas[type] to the API (one top-level object). */
export const schemas = {
  multiple_choice: multipleChoiceSchema,
  true_false: trueFalseSchema,
  flashcards: flashcardsSchema,
  matching: matchingSchema,
  ordering: orderingSchema,
} satisfies Record<ActivityType, z.ZodType>;

/** Any activity. Use for validating saved/loaded data, not for the API call. */
export const activitySchema = z.discriminatedUnion("type", [
  multipleChoiceSchema,
  trueFalseSchema,
  flashcardsSchema,
  matchingSchema,
  orderingSchema,
]);

export type Activity = z.infer<typeof activitySchema>;
