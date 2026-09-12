import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Shared Prev/Next pager used by every paginated list (appointments,
// revenue's completed-visits breakdown, patients, a patient's visit
// history). `buildHref` lets each page decide how to construct its own
// URL — the current filters/search/month need to carry forward, and
// only the calling page knows what those are.
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-3 flex items-center justify-between">
      <span className="text-[13px] text-slate-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Link
          href={buildHref(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 ${
            page <= 1 ? "pointer-events-none text-slate-300" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ChevronLeft size={15} />
        </Link>
        <Link
          href={buildHref(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 ${
            page >= totalPages ? "pointer-events-none text-slate-300" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
