"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Briefcase, Car, Clapperboard, Coins, CreditCard, GraduationCap, HeartPulse, House, Landmark, PiggyBank, Receipt, Shield, ShoppingBag, Smartphone, Target, Trophy, Utensils, Vault } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/components/ui/toast-provider";
import { CATEGORY_ICON_OPTIONS, WALLET_ICON_OPTIONS } from "@/lib/icon-options";

const iconMap = {
  utensils: Utensils,
  house: House,
  car: Car,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  clapperboard: Clapperboard,
  briefcase: Briefcase,
  coins: Coins,
  wallet: CreditCard,
  banknote: Banknote,
  landmark: Landmark,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  "piggy-bank": PiggyBank,
  vault: Vault,
  target: Target,
  shield: Shield,
  trophy: Trophy,
};

function IconOptionGrid({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {options.map((option) => {
        const Icon = iconMap[option.value] || Coins;
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            title={option.label}
            aria-label={option.label}
            className={`flex items-center justify-center rounded-2xl border p-3 transition ${
              active ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-white hover:bg-muted"
            }`}
            onClick={() => onChange(option.value)}
          >
            <div className={`rounded-xl p-2 ${active ? "bg-primary text-primary-foreground" : "bg-muted text-slate-600"}`}>
              <Icon className="h-4 w-4" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function createInitialWalletForm() {
  return {
    name: "",
    type: "cash",
    balance: "0.00",
    currencyId: "",
    icon: "wallet",
    color: "#0f766e",
  };
}

function createInitialCategoryForm(type) {
  return {
    name: "",
    type: type === "income" ? "income" : "expense",
    icon: "",
    color: "#0f766e",
  };
}

export function QuickSetupModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("wallet");
  const [categoryType, setCategoryType] = useState("expense");
  const [walletForm, setWalletForm] = useState(createInitialWalletForm);
  const [categoryForm, setCategoryForm] = useState(createInitialCategoryForm("expense"));
  const [currencies, setCurrencies] = useState([]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let active = true;

    fetch("/api/dashboard/overview?mode=lookups", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (active) {
          setCurrencies(payload.lookups?.currencies || []);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleOpen(event) {
      const nextMode = event.detail?.mode === "category" ? "category" : "wallet";
      const nextCategoryType = event.detail?.categoryType === "income" ? "income" : "expense";

      setMode(nextMode);
      setCategoryType(nextCategoryType);
      setWalletForm(createInitialWalletForm());
      setCategoryForm(createInitialCategoryForm(nextCategoryType));
      setOpen(true);
    }

    window.addEventListener("dashboard-setup-open", handleOpen);
    return () => {
      window.removeEventListener("dashboard-setup-open", handleOpen);
    };
  }, []);

  const categoryTitle = useMemo(() => (categoryType === "income" ? "Create Income Category" : "Create Expense Category"), [categoryType]);

  async function handleWalletSubmit(event) {
    event.preventDefault();
    setSaving(true);

    const response = await fetch("/api/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(walletForm),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.push(data.error || "Could not create wallet", "error");
      return;
    }

    toast.push("Wallet created");
    setOpen(false);
    window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    window.dispatchEvent(new CustomEvent("dashboard-lookups-refresh"));
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    setSaving(true);

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryForm),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.push(data.error || "Could not create category", "error");
      return;
    }

    toast.push(categoryType === "income" ? "Income category created" : "Expense category created");
    setOpen(false);
    window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    window.dispatchEvent(new CustomEvent("dashboard-lookups-refresh"));
  }

  return (
    <Modal open={open} title={mode === "wallet" ? "Create Wallet" : categoryTitle} onClose={() => setOpen(false)}>
      {mode === "wallet" ? (
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleWalletSubmit}>
          <label>
            <span className="mb-2 block text-sm font-medium">Name</span>
            <input
              type="text"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={walletForm.name}
              onChange={(event) => setWalletForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Type</span>
            <input
              type="text"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={walletForm.type}
              onChange={(event) => setWalletForm((current) => ({ ...current, type: event.target.value }))}
              placeholder="cash"
              required
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Balance</span>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={walletForm.balance}
              onChange={(event) => setWalletForm((current) => ({ ...current, balance: event.target.value }))}
              required
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Currency</span>
            <SearchableSelect
              label="Currency"
              value={walletForm.currencyId}
              options={currencies}
              placeholder="Default currency"
              onChange={(nextValue) => setWalletForm((current) => ({ ...current, currencyId: nextValue }))}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Icon</span>
            <input
              type="hidden"
              value={walletForm.icon}
              onChange={() => {}}
            />
            <IconOptionGrid options={WALLET_ICON_OPTIONS} value={walletForm.icon} onChange={(nextValue) => setWalletForm((current) => ({ ...current, icon: nextValue }))} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Color</span>
            <div className="flex gap-3">
              <input type="color" className="h-12 w-16 rounded-2xl border border-border bg-white px-1 py-1" value={walletForm.color} onChange={(event) => setWalletForm((current) => ({ ...current, color: event.target.value }))} />
              <input
                type="text"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={walletForm.color}
                onChange={(event) => setWalletForm((current) => ({ ...current, color: event.target.value }))}
              />
            </div>
          </label>
          <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create Wallet"}
            </Button>
          </div>
        </form>
      ) : (
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCategorySubmit}>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Category Name</span>
            <input
              type="text"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={categoryForm.name}
              onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Type</span>
            <select
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={categoryForm.type}
              onChange={(event) => {
                setCategoryType(event.target.value);
                setCategoryForm((current) => ({ ...current, type: event.target.value }));
              }}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Icon</span>
            <input
              type="hidden"
              value={categoryForm.icon}
              onChange={() => {}}
            />
            <IconOptionGrid options={CATEGORY_ICON_OPTIONS} value={categoryForm.icon} onChange={(nextValue) => setCategoryForm((current) => ({ ...current, icon: nextValue }))} />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Color</span>
            <div className="flex gap-3">
              <input type="color" className="h-12 w-16 rounded-2xl border border-border bg-white px-1 py-1" value={categoryForm.color} onChange={(event) => setCategoryForm((current) => ({ ...current, color: event.target.value }))} />
              <input
                type="text"
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                value={categoryForm.color}
                onChange={(event) => setCategoryForm((current) => ({ ...current, color: event.target.value }))}
              />
            </div>
          </label>
          <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : categoryForm.type === "income" ? "Create Income Category" : "Create Expense Category"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
