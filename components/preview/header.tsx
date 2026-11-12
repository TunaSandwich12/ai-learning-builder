// Title and instructions at the top of every preview. AI text is placed as plain
// {value} children, so React escapes it. Never use dangerouslySetInnerHTML here.
export function PreviewHeader({ title, instructions }: { title: string; instructions: string }) {
  return (
    <div className="min-w-0 border-b border-rule pb-5">
      <h3 id="preview-title" className="text-xl break-words sm:text-2xl">
        {title}
      </h3>
      <p className="mt-2 break-words text-muted">{instructions}</p>
    </div>
  );
}

/** The panel every preview sits on (inside the editor's step card). */
export const previewSheet = "flex flex-col gap-6 rounded-2xl border border-rule bg-surface p-5 sm:p-6";
