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
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="civic-gradient-text">{title}</span>
        </h1>
        {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
