"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Link2, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { useLiveUpdateListener } from "@/lib/live-client";

function extractInviteToken(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.includes("/dashboard/groups/join/")) {
    return trimmed.split("/dashboard/groups/join/").pop()?.split("?")[0] || "";
  }

  return trimmed;
}

export function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [joinLink, setJoinLink] = useState("");
  const toast = useToast();
  const router = useRouter();

  async function loadGroups() {
    const response = await fetch("/api/groups");
    const data = await response.json();
    setGroups(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/groups")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) {
          setGroups(data.items || []);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useLiveUpdateListener(["groups"], () => {
    loadGroups();
  });

  async function createGroup(event) {
    event.preventDefault();
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.push(data.error || "Could not create group", "error");
      return;
    }

    toast.push("Group created");
    setOpen(false);
    setForm({ name: "", description: "" });
    router.push(`/dashboard/groups/${data.id}`);
    router.refresh();
  }

  async function generateInvite(groupId) {
    const response = await fetch(`/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresInDays: 7, maxUses: 25 }),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.push(data.error || "Could not create invite link", "error");
      return;
    }

    await navigator.clipboard.writeText(data.inviteLink);
    toast.push("Invite link copied");
    loadGroups();
  }

  function openJoinLink() {
    const token = extractInviteToken(joinLink);
    if (!token) {
      toast.push("Paste a valid join link or token", "error");
      return;
    }

    setJoinOpen(false);
    setJoinLink("");
    router.push(`/dashboard/groups/join/${token}`);
  }

  if (loading) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Family & Team Groups</h2>
            <p className="mt-1 text-sm text-slate-500">Create shared finance workspaces, invite members with secure links, and track group activity together.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={() => setJoinOpen(true)}>
              <Link2 className="mr-2 h-4 w-4" />
              Join group
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create group
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.length ? (
          groups.map((group) => (
            <Card key={group.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                      {group.role}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{group.description || "Shared group workspace for transactions, members, and activity."}</p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-muted p-3">
                  <p className="text-slate-500">Members</p>
                  <p className="mt-1 text-lg font-semibold">{group._count?.members || 0}</p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <p className="text-slate-500">Transactions</p>
                  <p className="mt-1 text-lg font-semibold">{group._count?.transactions || 0}</p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <p className="text-slate-500">Messages</p>
                  <p className="mt-1 text-lg font-semibold">{group._count?.messages || 0}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/dashboard/groups/${group.id}`}>
                  <Button>Open workspace</Button>
                </Link>
                {["owner", "admin"].includes(group.role) ? (
                  <Button variant="secondary" onClick={() => generateInvite(group.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy invite
                  </Button>
                ) : null}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-10 text-center lg:col-span-2">
            <h3 className="text-lg font-semibold">No groups yet</h3>
            <p className="mt-2 text-sm text-slate-500">Create a family or team group, then share the invite link so everyone can track finance activity together.</p>
          </Card>
        )}
      </div>

      <Modal open={open} title="Create Shared Group" onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={createGroup}>
          <label>
            <span className="mb-2 block text-sm font-medium">Group name</span>
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Description</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create group</Button>
          </div>
        </form>
      </Modal>

      <Modal open={joinOpen} title="Join Shared Group" onClose={() => setJoinOpen(false)}>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">Paste the invite link or token shared by your family or team admin. We will take you to the secure join page.</p>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Invite link or token</span>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
              <Link2 className="h-4 w-4 text-slate-500" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Paste invite link or token"
                value={joinLink}
                onChange={(event) => setJoinLink(event.target.value)}
              />
            </div>
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setJoinOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={openJoinLink}>
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
