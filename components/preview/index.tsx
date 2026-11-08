import type { Activity } from "@/src/lib/schemas";
import { FlashcardsPreview } from "./flashcards";
import { MatchingPreview } from "./matching";
import { MultipleChoicePreview } from "./multiple-choice";
import { OrderingPreview } from "./ordering";
import { TrueFalsePreview } from "./true-false";

/** Picks the teacher preview for the activity's type. */
export function ActivityPreview({ activity }: { activity: Activity }) {
  switch (activity.type) {
    case "multiple_choice":
      return <MultipleChoicePreview activity={activity} />;
    case "true_false":
      return <TrueFalsePreview activity={activity} />;
    case "flashcards":
      return <FlashcardsPreview activity={activity} />;
    case "matching":
      return <MatchingPreview activity={activity} />;
    case "ordering":
      return <OrderingPreview activity={activity} />;
    default: {
      // A new activity type without a preview fails the typecheck here.
      const unhandled: never = activity;
      return unhandled;
    }
  }
}
