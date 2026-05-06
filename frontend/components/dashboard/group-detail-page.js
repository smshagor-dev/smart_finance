"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, MessageSquare, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useLiveUpdateListener } from "@/lib/live-client";
import { formatCurrency, formatDate } from "@/lib/utils";

export function GroupDetailPage({ groupId }) {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [inviteForm, setInviteForm] = useState({ expiresInDays: 7, maxUses: 25 });

  async function loadGroup() {
    const response = await fetch(`/api/groups/${groupId}`);
    const payload = await response.json();
    setData(payload);
  }

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/groups/${groupId}`)
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  useLiveUpdateListener(["groups", "transactions", "notifications"], () => {
    loadGroup();
  });

  async function createInvite(event) {
    event.preventDefault();
    const response = await fetch(`/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error || "Could not create invite");
      return;
    }

    await navigator.clipboard.writeText(payload.inviteLink);
    toast.success("Invite link copied");
    loadGroup();
  }

  async function sendMessage(event) {
    event.preventDefault();
    const response = await fetch(`/api/groups/${groupId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: message }),
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error || "Could not send message");
      return;
    }

    setMessage("");
    loadGroup();
  }

  if (!data) {
    return <LoadingSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">{data.name}</h2>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                {data.currentUserRole}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{data.description || "Shared finance workspace for your family or team."}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/transactions?groupId=${data.id}`}>
              <Button variant="secondary">View group transactions</Button>
            </Link>
            {data.canManage ? (
              <Button onClick={() => document.getElementById("group-invite-form")?.scrollIntoView({ behavior: "smooth" })}>
                <Plus className="mr-2 h-4 w-4" />
                Create invite
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Members", value: data.members?.length || 0 },
            { label: "Transactions", value: data.stats?.totalTransactions || 0 },
            { label: "Monthly Income", value: formatCurrency(data.stats?.monthlyIncome || 0, data.currencyCode || "USD") },
            { label: "Monthly Expense", value: formatCurrency(data.stats?.monthlyExpense || 0, data.currencyCode || "USD") },
          ].map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Members</h3>
            </div>
            <div className="mt-4 space-y-3">
              {data.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-2xl bg-muted p-4">
                  <div>
                    <p className="font-medium">{member.user?.name || member.user?.email}</p>
                    <p className="text-sm text-slate-500">{member.user?.email || "No email"}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {data.canManage ? (
            <Card className="p-5" id="group-invite-form">
              <h3 className="text-lg font-semibold">Share Invite Link</h3>
              <p className="mt-1 text-sm text-slate-500">Generate secure links so family or team members can join this shared finance workspace.</p>
              <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={createInvite}>
                <label>
                  <span className="mb-2 block text-sm font-medium">Expires in days</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                    value={inviteForm.expiresInDays}
                    onChange={(event) => setInviteForm((current) => ({ ...current, expiresInDays: Number(event.target.value) }))}
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-medium">Max uses</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                    value={inviteForm.maxUses}
                    onChange={(event) => setInviteForm((current) => ({ ...current, maxUses: Number(event.target.value) }))}
                  />
                </label>
                <div className="md:col-span-2">
                  <Button type="submit">
                    <Copy className="mr-2 h-4 w-4" />
                    Generate and copy invite link
                  </Button>
                </div>
              </form>

              <div className="mt-5 space-y-2">
                {data.invites?.length ? (
                  data.invites.map((invite) => (
                    <div key={invite.id} className="rounded-2xl bg-muted p-4 text-sm">
                      <p className="font-medium">Invite link active</p>
                      <p className="mt-1 text-slate-500">Expires {formatDate(invite.expiresAt)} | Uses {invite.usesCount}/{invite.maxUses}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No invite links created yet.</p>
                )}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-lg font-semibold">Recent Shared Transactions</h3>
            <div className="mt-4 space-y-3">
              {data.recentTransactions?.length ? (
                data.recentTransactions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-muted p-4">
                    <div>
                      <p className="font-medium">{item.category?.name || item.type}</p>
                      <p className="text-sm text-slate-500">
                        {item.user?.name || item.user?.email} | {formatDate(item.transactionDate)}
                      </p>
                    </div>
                    <p className={item.type === "expense" ? "text-red-600" : "text-green-700"}>{formatCurrency(item.displayAmount || item.amount, item.displayCurrencyCode || data.currencyCode || "USD")}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No shared transactions yet</div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Group Communication</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">Use this shared thread for finance coordination, context, and follow-up actions.</p>

            <form className="mt-4 flex gap-3" onSubmit={sendMessage}>
              <input
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
                placeholder="Write a message for the group"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <Button type="submit">Send</Button>
            </form>

            <div className="mt-4 space-y-3">
              {data.messages?.length ? (
                data.messages.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-muted p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{item.user?.name || item.user?.email}</p>
                      <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.body}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-slate-500">No messages yet</div>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
