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
    <div className="flex flex-col gap-6">
      <header className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight break-words">{activity.title}</h1>
        <p className="mt-1 text-zinc-600 break-words dark:text-zinc-400">{activity.instructions}</p>
      </header>
      <Player activity={activity} />
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
