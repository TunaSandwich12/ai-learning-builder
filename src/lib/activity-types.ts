import { activityTypes, type ActivityType } from "./schemas";

type ActivityTypeInfo = {
  label: string;
  description: string;
  placeholder: string;
};

// Text shown on the "New activity" page for each activity type.
export const activityTypeInfo = {
  multiple_choice: {
    label: "Multiple choice",
    description: "Questions with 4 answer options, one correct.",
    placeholder:
      "e.g. 8 questions for Grade 5 on the water cycle: evaporation, condensation, precipitation and collection.",
  },
  true_false: {
    label: "True or false",
    description: "Statements students mark true or false.",
    placeholder: "e.g. 10 true/false statements about the planets in our solar system for Grade 4.",
  },
  flashcards: {
    label: "Flashcards",
    description: "Terms on the front, answers on the back.",
    placeholder: "e.g. Flashcards for these Spanish food words: manzana, pan, leche, queso, huevo…",
  },
  matching: {
    label: "Matching",
    description: "Students pair each item with its match.",
    placeholder: "e.g. Match each country in South America to its capital city.",
  },
  ordering: {
    label: "Ordering",
    description: "Students put steps or events in order.",
    placeholder: "e.g. The stages of a butterfly's life cycle, from egg to adult.",
  },
} satisfies Record<ActivityType, ActivityTypeInfo>;

/** The types in display order, with their text. */
export const activityTypeOptions = activityTypes.map((type) => ({
  type,
  ...activityTypeInfo[type],
}));
