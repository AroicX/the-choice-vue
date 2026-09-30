/**
 * Page title block for wide (non-timeline) pages: plain bold title, one line
 * of muted description, optional action on the right.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-1 text-[13px] font-medium text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="text-[26px] font-bold leading-8 tracking-[-0.02em]">{title}</h1>
        {description ? <p className="mt-1 text-[15px] leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
