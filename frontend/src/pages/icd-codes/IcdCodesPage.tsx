import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import { createIcdCode, searchIcdCodes } from "../../services/clinicalService";
import type { IcdCode } from "../../types/clinical";

type FormState = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export function IcdCodesPage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [codes, setCodes] = useState<IcdCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    id: "",
    name: "",
    category: "",
    description: "",
  });

  const selectedCategory = useMemo(() => category.trim(), [category]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchIcdCodes(keyword.trim() || undefined, selectedCategory || undefined);
        if (!active) return;
        setCodes(data);
      } catch (loadError: any) {
        console.error(loadError);
        if (active) setError(loadError?.response?.data?.message || "Could not load ICD codes.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [keyword, selectedCategory]);

  const handleCreate = async () => {
    if (!form.id.trim() || !form.name.trim()) {
      alert("ICD id and name are required.");
      return;
    }

    setSaving(true);
    try {
      await createIcdCode({
        id: form.id.trim(),
        name: form.name.trim(),
        category: form.category.trim() || null,
        description: form.description.trim() || null,
      });
      setForm({ id: "", name: "", category: "", description: "" });
      const data = await searchIcdCodes(keyword.trim() || undefined, selectedCategory || undefined);
      setCodes(data);
    } catch (saveError: any) {
      console.error(saveError);
      alert(saveError?.response?.data?.message || saveError?.message || "Could not create ICD code.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
              Admin catalog
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">ICD Codes</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Search, browse, and create ICD codes used in diagnosis workflows.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setKeyword((prev) => prev.trim())}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <AppIcon name="refresh" className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Create ICD code</h3>
          <div className="mt-4 grid gap-3">
            <input
              value={form.id}
              onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
              placeholder="Code id, e.g. I10"
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Name"
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />
            <input
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Category"
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Description"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="h-11 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Create code
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search keyword"
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Filter category"
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />
          </div>

          <div className="mt-4 text-sm text-slate-500">
            {loading ? "Loading..." : `${codes.length} ICD codes`}
          </div>
          {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}

          <div className="mt-4 max-h-[38rem] space-y-3 overflow-auto pr-1">
            {codes.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500">No ICD codes found.</div>
            ) : (
              codes.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{item.id}</div>
                      <div className="mt-1 text-sm text-slate-700">{item.name}</div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {item.category || "Uncategorized"}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">{item.description || "No description"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
