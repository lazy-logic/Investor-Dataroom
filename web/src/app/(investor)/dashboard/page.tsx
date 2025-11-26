import { Card } from "@/components/ui/card";

export default function InvestorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          SAYeTECH Investor Data Room
        </h1>
        <p className="text-sm text-slate-600">
          High-level overview of SAYeTECH and quick links to key documents.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="text-sm font-medium text-slate-700">Round details</h2>
          <p className="mt-2 text-xs text-slate-500">
            Placeholder for amount raising, min ticket, and round status.
          </p>
        </Card>
        <Card>
          <h2 className="text-sm font-medium text-slate-700">Key metrics</h2>
          <p className="mt-2 text-xs text-slate-500">
            Placeholder for traction and growth metrics.
          </p>
        </Card>
        <Card>
          <h2 className="text-sm font-medium text-slate-700">Access status</h2>
          <p className="mt-2 text-xs text-slate-500">
            Placeholder for permission level and expiry information.
          </p>
        </Card>
      </div>
      <Card>
        <h2 className="text-sm font-medium text-slate-700">Start your review</h2>
        <p className="mt-2 text-xs text-slate-500">
          Shortcut links to Pitch Deck, One-pager, and Data Room Index will be
          wired here.
        </p>
      </Card>
    </div>
  );
}
