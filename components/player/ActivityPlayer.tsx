"use client";

import type { Activity } from "@/src/lib/schemas";
import { FlashcardsPlayer } from "./flashcards";
import { MatchingPlayer } from "./matching";
import { MultipleChoicePlayer } from "./multiple-choice";
import { OrderingPlayer } from "./ordering";
import { TrueFalsePlayer } from "./true-false";

/** The student view of an activity: title, instructions and the right player for its type. */
export function ActivityPlayer({ activity }: { activity: Activity }) {
  return (
    <div className="flex flex-col gap-8">
      <header className="min-w-0">
        <h1 className="text-3xl font-bold break-words sm:text-4xl">{activity.title}</h1>
        <p className="mt-3 max-w-prose text-lg break-words text-muted">{activity.instructions}</p>
      </header>
      <div className="card p-5 sm:p-8">
        <Player activity={activity} />
      </div>
    </div>
  );
}

function Player({ activity }: { activity: Activity }) {
  switch (activity.type) {
    case "multiple_choice":
      return <MultipleChoicePlayer activity={activity} />;
    case "true_false":
      return <TrueFalsePlayer activity={activity} />;
    case "flashcards":
      return <FlashcardsPlayer activity={activity} />;
    case "matching":
      return <MatchingPlayer activity={activity} />;
    case "ordering":
      return <OrderingPlayer activity={activity} />;
    default: {
      // A new activity type without a player fails the typecheck here.
      const unhandled: never = activity;
      return unhandled;
    }
  }
}
