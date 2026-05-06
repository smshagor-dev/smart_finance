"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

const countCards = [
  { key: "wallets", label: "Wallets" },
  { key: "transactions", label: "Transactions" },
  { key: "budgets", label: "Budgets" },
  { key: "savingsGoals", label: "Savings Goals" },
  { key: "debtLoans", label: "Debts" },
  { key: "groupMemberships", label: "Groups" },
];

export function AdminUserDetailPage({ userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    fetch(`/api/admin/users/${userId}`)
      .then((response) => response.json())
      .then((payload) => {
        if (active) {
          setData(payload);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  if (!data) {
    return <LoadingSkeleton rows={10} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard/admin/users">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Button>
        </Link>
        <div className="rounded-full bg-muted px-4 py-2 text-sm text-slate-600">
          {data.role} • {data.emailVerified ? "verified" : "pending verification"}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold">{data.name || "Unnamed user"}</h3>
            <p className="mt-1 text-sm text-slate-500">{data.email}</p>
            <p className="mt-3 text-sm text-slate-500">
              Joined {formatDate(data.createdAt)} • Default currency {data.defaultCurrency?.code || "USD"}
            </p>
          </div>
          <div className="rounded-3xl bg-muted px-5 py-4 text-sm text-slate-600">
            <p>Theme: {data.settings?.theme || "light"}</p>
            <p className="mt-1">Language: {data.settings?.language || "en"}</p>
            <p className="mt-1">Timezone: {data.settings?.timezone || "UTC"}</p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {countCards.map((item) => (
          <Card key={item.key} className="p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{data._count?.[item.key] || 0}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Recent transactions</h3>
          <div className="mt-4 space-y-3">
            {data.transactions?.length ? (
              data.transactions.map((transaction) => (
                <div key={transaction.id} className="rounded-2xl bg-muted p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{transaction.category?.name || transaction.type}</p>
                      <p className="text-sm text-slate-500">
                        {transaction.wallet?.name} • {formatDate(transaction.transactionDate)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(transaction.originalAmount, transaction.currency?.code || data.defaultCurrency?.code || "USD")}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No transactions found</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold">Wallets</h3>
          <div className="mt-4 space-y-3">
            {data.wallets?.length ? (
              data.wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between rounded-2xl bg-muted p-4">
                  <div>
                    <p className="font-medium">{wallet.name}</p>
                    <p className="text-sm text-slate-500">{wallet.type}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(wallet.balance, wallet.currency?.code || data.defaultCurrency?.code || "USD")}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No wallets found</div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Group memberships</h3>
          <div className="mt-4 space-y-3">
            {data.groupMemberships?.length ? (
              data.groupMemberships.map((membership) => (
                <div key={membership.id} className="rounded-2xl bg-muted p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{membership.group?.name}</p>
                      <p className="text-sm text-slate-500">{membership.role}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {membership.group?._count.members} members
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No active groups</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold">Recent receipts</h3>
          <div className="mt-4 space-y-3">
            {data.receipts?.length ? (
              data.receipts.map((receipt) => (
                <a
                  key={receipt.id}
                  href={receipt.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl bg-muted p-4 transition hover:bg-slate-100"
                >
                  <p className="font-medium">{receipt.originalName}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(receipt.uploadedAt)}</p>
                </a>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No receipts uploaded</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
