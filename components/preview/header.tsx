// Title and instructions at the top of every preview. AI text is placed as plain
// {value} children, so React escapes it. Never use dangerouslySetInnerHTML here.
export function PreviewHeader({ title, instructions }: { title: string; instructions: string }) {
  return (
    <div className="min-w-0">
      <h2 id="preview-title" className="text-xl font-bold break-words">
        {title}
      </h2>
      <p className="mt-1 text-zinc-600 break-words dark:text-zinc-400">{instructions}</p>
    </div>
  );
}
