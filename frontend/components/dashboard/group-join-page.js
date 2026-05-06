"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast-provider";
import { formatDate } from "@/lib/utils";

export function GroupJoinPage({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/groups/join/${token}`)
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function joinGroup() {
    const response = await fetch(`/api/groups/join/${token}`, {
      method: "POST",
    });
    const payload = await response.json();

    if (!response.ok) {
      toast.push(payload.error || "Could not join group", "error");
      return;
    }

    toast.push(payload.alreadyJoined ? "You are already in this group" : "Joined group successfully");
    router.push(`/dashboard/groups/${payload.groupId}`);
    router.refresh();
  }

  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (!data?.group) {
    return (
      <Card className="p-10 text-center">
        <h2 className="text-2xl font-semibold">Invite not available</h2>
        <p className="mt-2 text-sm text-slate-500">{data?.error || "This invite link is invalid or expired."}</p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl p-8">
      <h2 className="text-2xl font-semibold">Join {data.group.name}</h2>
      <p className="mt-2 text-sm text-slate-500">{data.group.description || "Shared group workspace for family or team finance tracking."}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-muted p-4">
          <p className="text-sm text-slate-500">Owner</p>
          <p className="mt-1 font-semibold">{data.group.owner?.name || data.group.owner?.email}</p>
        </div>
        <div className="rounded-2xl bg-muted p-4">
          <p className="text-sm text-slate-500">Members</p>
          <p className="mt-1 font-semibold">{data.group.membersCount}</p>
        </div>
        <div className="rounded-2xl bg-muted p-4">
          <p className="text-sm text-slate-500">Invite expires</p>
          <p className="mt-1 font-semibold">{formatDate(data.expiresAt)}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={joinGroup}>{data.alreadyJoined ? "Open group" : "Join group"}</Button>
        <Button variant="secondary" onClick={() => router.push("/dashboard/groups")}>
          Back to groups
        </Button>
      </div>
    </Card>
  );
}
