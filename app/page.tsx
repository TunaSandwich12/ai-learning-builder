import Link from "next/link";
import { SiteHeader } from "@/components/ui/header";
import { activityTypeOptions } from "@/src/lib/activity-types";
import { samples } from "@/src/lib/samples";

const steps = [
  {
    title: "Describe it",
    text: "Pick an activity type and write what you want, or paste your lesson notes.",
  },
  {
    title: "Check and adjust",
    text: "Read every question and answer before anyone sees it. Ask for changes in plain words.",
  },
  {
    title: "Share the link",
    text: "Students open it on a phone or laptop. No accounts, nothing to install.",
  },
];

// A real sample question, shown the way a student sees it after answering.
const demo = samples.multiple_choice;
const demoQuestion = demo.questions[0];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader href="/">
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-secondary hidden sm:inline-flex">
            Log in
          </Link>
          <Link href="/login" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </SiteHeader>

      <main className="flex-1">
        <section
          aria-labelledby="home-title"
          className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-24"
        >
          <div>
            <h1 id="home-title" className="text-4xl font-bold sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              Classroom activities, ready before the bell
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Turn a topic or your own notes into a quiz, flashcards or a matching game. Check it,
              change it, then share one link with your class.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn btn-primary btn-lg">
                Create your first activity
              </Link>
              <span className="text-sm text-muted">Students don&apos;t need an account.</span>
            </div>
          </div>

          {/* Static picture of the student view. Not interactive, so hidden from screen readers. */}
          <div aria-hidden="true" className="card p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <span className="tag">Multiple choice</span>
              <span className="text-sm font-medium text-muted">
                Question 1 of {demo.questions.length}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full w-1/6 rounded-full bg-primary" />
            </div>
            <p className="mt-5 text-lg font-semibold">{demoQuestion.question}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {demoQuestion.options.map((option) => (
                <li
                  key={option.text}
                  className={
                    "flex items-center justify-between rounded-2xl border-[1.5px] px-4 py-2.5 " +
                    (option.isCorrect ? "border-good-line bg-good-bg" : "border-rule")
                  }
                >
                  <span>{option.text}</span>
                  {option.isCorrect && <span className="text-sm font-semibold text-good-ink">Correct</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="how-title" className="border-y border-rule bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 id="how-title" className="text-3xl font-bold">
              How it works
            </h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map((step, i) => (
                <li key={step.title} className="rounded-[1.25rem] bg-paper p-6">
                  <span className="num">{i + 1}</span>
                  <h3 className="mt-4 text-lg">{step.title}</h3>
                  <p className="mt-2 text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="types-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 id="types-title" className="text-3xl font-bold">
            Five kinds of activity
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activityTypeOptions.map((option) => (
              <li key={option.type} className="card p-6">
                <h3 className="text-lg">{option.label}</h3>
                <p className="mt-1.5 text-muted">{option.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-rule bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted sm:px-6">
          AI Learning Builder. Made for classrooms.
        </div>
      </footer>
    </div>
  );
}
