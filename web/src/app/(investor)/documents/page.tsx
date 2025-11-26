import { Card } from "@/components/ui/card";

export default function DocumentsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="space-y-2 text-sm">
        <h2 className="font-semibold text-slate-700">Categories</h2>
        <div className="space-y-1">
          <button className="flex w-full items-center justify-between rounded-md bg-slate-100 px-3 py-2 text-left text-xs font-medium">
            <span>Company Overview</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-slate-600">
            <span>Market &amp; Impact</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-slate-600">
            <span>Financials</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-slate-600">
            <span>IP &amp; Technology</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-slate-600">
            <span>Traction</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-slate-600">
            <span>Legal</span>
          </button>
        </div>
      </aside>
      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-base font-semibold tracking-tight">Documents</h1>
          <input
            placeholder="Search documents"
            className="w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:border-brand-green"
          />
        </div>
        <Card>
          <p className="text-xs text-slate-500">
            Document list and previews will be implemented here. This placeholder
            reflects the planned investor documents UI.
          </p>
        </Card>
      </section>
    </div>
  );
}
