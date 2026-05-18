"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/components/ui/toast-provider";

function createInitialForm() {
  return {
    type: "income",
    amount: "",
    categoryId: "",
    walletId: "",
    groupId: "",
    currencyId: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    incomeSource: "",
    paymentMethod: "",
    attachmentUrl: "",
    note: "",
  };
}

export function QuickTransactionModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("income");
  const [lookups, setLookups] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(createInitialForm);
  const toast = useToast();

  useEffect(() => {
    let active = true;

    function loadLookups() {
      fetch("/api/dashboard/overview?mode=lookups", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload) => {
          if (active) {
            setLookups(payload.lookups || {});
          }
        })
        .catch(() => {
          if (active) {
            setLookups({});
          }
        });
    }

    loadLookups();

    function handleRefresh() {
      loadLookups();
    }

    window.addEventListener("dashboard-lookups-refresh", handleRefresh);

    return () => {
      active = false;
      window.removeEventListener("dashboard-lookups-refresh", handleRefresh);
    };
  }, []);

  useEffect(() => {
    function handleQuickCreate(event) {
      const nextType = event.detail?.type === "expense" ? "expense" : "income";
      setType(nextType);
      setForm({ ...createInitialForm(), type: nextType });
      setOpen(true);
    }

    window.addEventListener("dashboard-quick-create", handleQuickCreate);
    return () => {
      window.removeEventListener("dashboard-quick-create", handleQuickCreate);
    };
  }, []);

  const walletOptions = lookups.wallets || [];
  const incomeCategoryOptions = lookups.incomeCategories || [];
  const expenseCategoryOptions = lookups.expenseCategories || [];
  const categoryOptions = type === "income" ? incomeCategoryOptions : expenseCategoryOptions;
  const groupOptions = lookups.groups || [];
  const currencyOptions = lookups.currencies || [];
  const hasWallets = walletOptions.length > 0;
  const hasIncomeCategories = incomeCategoryOptions.length > 0;
  const hasExpenseCategories = expenseCategoryOptions.length > 0;
  const hasTypeCategories = type === "income" ? hasIncomeCategories : hasExpenseCategories;
  const canSubmit = hasWallets && hasTypeCategories;

  const setupMessage = useMemo(() => {
    if (!hasWallets && !hasTypeCategories) {
      return `Add at least one wallet and one ${type} category before creating this transaction.`;
    }

    if (!hasWallets) {
      return `Add at least one wallet before creating this ${type} transaction.`;
    }

    if (!hasTypeCategories) {
      return `Add at least one ${type} category before creating this transaction.`;
    }

    return "";
  }, [hasTypeCategories, hasWallets, type]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      toast.push("Complete wallet and category setup first", "error");
      return;
    }

    setSaving(true);

    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount: form.amount,
        originalAmount: form.amount,
        categoryId: form.categoryId || null,
        walletId: form.walletId,
        groupId: form.groupId || null,
        currencyId: form.currencyId || null,
        transactionDate: form.transactionDate,
        note: form.note || null,
        attachmentUrl: form.attachmentUrl || null,
        incomeSource: type === "income" ? form.incomeSource || null : null,
        paymentMethod: type === "expense" ? form.paymentMethod || null : null,
      }),
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.push(result.error || "Could not create record", "error");
      return;
    }

    toast.push(type === "income" ? "Income created" : "Expense created");
    setOpen(false);
    window.dispatchEvent(new CustomEvent("dashboard-refresh"));
  }

  async function handleFileUpload(file) {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const response = await fetch("/api/uploads/attachments", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        toast.push(data.error || "Upload failed", "error");
        return;
      }

      setForm((current) => ({ ...current, attachmentUrl: data.fileUrl }));
      toast.push("Attachment uploaded");
    } catch {
      toast.push("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  function openSetup(mode) {
    setOpen(false);
    window.dispatchEvent(
      new CustomEvent("dashboard-setup-open", {
        detail: {
          mode,
          categoryType: type,
        },
      }),
    );
  }

  return (
    <Modal open={open} title={canSubmit ? (type === "income" ? "Create Income" : "Create Expense") : "Complete Setup First"} onClose={() => setOpen(false)}>
      <div className="space-y-4">
        {!canSubmit ? (
          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-slate-900">Setup required</p>
            <p className="mt-1 text-sm text-slate-500">{setupMessage}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!hasWallets ? (
                <button
                  type="button"
                  className="inline-flex rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                  onClick={() => openSetup("wallet")}
                >
                  Create Wallet
                </button>
              ) : null}
              {!hasTypeCategories ? (
                <button
                  type="button"
                  className={`inline-flex rounded-2xl px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 ${
                    type === "income" ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                  onClick={() => openSetup("category")}
                >
                  Add {type === "income" ? "Income" : "Expense"} Category
                </button>
              ) : null}
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}

        {canSubmit ? (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label>
              <span className="mb-2 block text-sm font-medium">Type</span>
              <select
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={type}
                onChange={(event) => {
                  const nextType = event.target.value === "expense" ? "expense" : "income";
                  setType(nextType);
                  setForm((current) => ({ ...current, type: nextType, categoryId: "", incomeSource: "", paymentMethod: "" }));
                }}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">Amount</span>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                required
              />
            </label>
            {type === "income" ? (
              <label>
                <span className="mb-2 block text-sm font-medium">Income Source</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                  value={form.incomeSource}
                  onChange={(event) => setForm((current) => ({ ...current, incomeSource: event.target.value }))}
                />
              </label>
            ) : (
              <label>
                <span className="mb-2 block text-sm font-medium">Payment Method</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                  value={form.paymentMethod}
                  onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))}
                />
              </label>
            )}
            <label>
              <span className="mb-2 block text-sm font-medium">Category</span>
              <select
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.categoryId}
                onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
              >
                <option value="">Select</option>
                {categoryOptions.map((option) => (
                  <option key={option.value || option.id} value={option.value || option.id}>
                    {option.label || option.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">Wallet</span>
              <select
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.walletId}
                onChange={(event) => setForm((current) => ({ ...current, walletId: event.target.value }))}
                required
              >
                <option value="">Select</option>
                {walletOptions.map((option) => (
                  <option key={option.value || option.id} value={option.value || option.id}>
                    {option.label || option.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">Group</span>
              <select
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.groupId}
                onChange={(event) => setForm((current) => ({ ...current, groupId: event.target.value }))}
              >
                <option value="">Select</option>
                {groupOptions.map((option) => (
                  <option key={option.value || option.id} value={option.value || option.id}>
                    {option.label || option.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">Currency</span>
              <SearchableSelect
                label="Currency"
                value={form.currencyId}
                options={currencyOptions}
                placeholder="Select"
                onChange={(nextValue) => setForm((current) => ({ ...current, currencyId: nextValue }))}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">Date</span>
              <input
                type="date"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.transactionDate}
                onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))}
                required
              />
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium">Attachment</span>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload attachment"}
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                        event.target.value = "";
                      }}
                      disabled={uploading}
                    />
                  </label>
                  {form.attachmentUrl ? (
                    <>
                      <a href={form.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium transition hover:bg-muted">
                        <ExternalLink className="h-4 w-4" />
                        Open file
                      </a>
                      <Button type="button" variant="secondary" onClick={() => setForm((current) => ({ ...current, attachmentUrl: "" }))}>
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </>
                  ) : null}
                </div>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                  value={form.attachmentUrl}
                  onChange={(event) => setForm((current) => ({ ...current, attachmentUrl: event.target.value }))}
                  placeholder="Uploaded file URL will appear here"
                />
              </div>
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium">Note</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              />
            </label>
            <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : type === "income" ? "Create Income" : "Create Expense"}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </Modal>
  );
}
