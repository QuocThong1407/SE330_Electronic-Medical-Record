export function DashboardPage() {
  const cards = [
    { label: "Users", value: "Manage accounts, roles, and status" },
    { label: "Doctors", value: "Doctor profile and specialization data" },
    { label: "Patients", value: "Walk-in and linked patient profiles" },
    { label: "Catalog", value: "Departments and specializations" },
  ];

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle mt-2">
          This is a starter dashboard. We can wire real stats later from backend endpoints.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              {card.label}
            </div>
            <div className="mt-3 text-sm text-slate-600">{card.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
