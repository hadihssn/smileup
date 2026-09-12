import type { ReactNode } from "react";

// One consistent header shape across every /admin/* page: a title, an
// optional one-line subtitle, and an optional primary action on the
// right. Previously every page hand-rolled its own title markup with
// slightly different spacing/sizing each time.
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
