"use client";

import type { Activity } from "@/src/lib/schemas";
import { MultipleChoicePlayer } from "./multiple-choice";

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
    case "flashcards":
    case "matching":
    case "ordering":
      return (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          This activity type is coming soon.
        </p>
      );
    default: {
      // A new activity type without a player fails the typecheck here.
      const unhandled: never = activity;
      return unhandled;
    }
  }
}
