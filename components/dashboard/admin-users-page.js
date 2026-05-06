"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import { useLiveUpdateListener } from "@/lib/live-client";
import { formatDate } from "@/lib/utils";

const defaultForm = {
  name: "",
  email: "",
  role: "user",
  defaultCurrencyId: "",
  emailVerified: false,
};

export function AdminUsersPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: "", role: "", page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  async function loadUsers({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    const params = new URLSearchParams(
      Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key, value]) => [key, String(value)]),
    );

    const response = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await response.json();
    setItems(data.items || []);
    setPagination(data.pagination || null);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    const params = new URLSearchParams(
      Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key, value]) => [key, String(value)]),
    );

    fetch(`/api/admin/users?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setItems(data.items || []);
        setPagination(data.pagination || null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  useEffect(() => {
    let active = true;

    fetch("/api/dashboard/overview?mode=lookups")
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          setCurrencies(data.lookups?.currencies || []);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useLiveUpdateListener(["admin-users"], () => {
    loadUsers({ silent: true });
  });

  function openEditor(user) {
    setEditing(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      defaultCurrencyId: user.defaultCurrency?.id || "",
      emailVerified: Boolean(user.emailVerified),
    });
    setOpen(true);
  }

  async function handleSave(event) {
    event.preventDefault();

    const response = await fetch(`/api/admin/users/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.push(data.error || "Could not update user", "error");
      return;
    }

    toast.push("User updated");
    setOpen(false);
    loadUsers({ silent: true });
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.name || user.email}? This removes all related finance data.`)) {
      return;
    }

    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      toast.push(data.error || "Could not delete user", "error");
      return;
    }

    toast.push("User deleted");
    loadUsers({ silent: true });
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_220px_180px]">
          <input
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none"
            placeholder="Search by name or email"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
          />
          <select
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none"
            value={filters.role}
            onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value, page: 1 }))}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <div className="hidden xl:flex items-center justify-end text-sm text-slate-500">
            {pagination ? `${pagination.total} users` : "Users"}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={7} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">User</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Role</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Currency</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Verified</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Activity</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Joined</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((user) => (
                    <tr key={user.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <p className="font-medium">{user.name || "Unnamed user"}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 uppercase text-slate-600">{user.role}</td>
                      <td className="px-4 py-3">{user.defaultCurrency?.code || "USD"}</td>
                      <td className="px-4 py-3">{user.emailVerified ? "Verified" : "Pending"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {user._count.transactions} transactions • {user._count.groupMemberships} groups
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/dashboard/admin/users/${user.id}`} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium transition hover:bg-muted">
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                          <Button variant="secondary" className="gap-2" onClick={() => openEditor(user)}>
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button variant="danger" className="gap-2" onClick={() => handleDelete(user)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-border">
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Modal open={open} title="Edit user" onClose={() => setOpen(false)}>
        <form className="grid max-h-[75vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2" onSubmit={handleSave}>
          <label>
            <span className="mb-2 block text-sm font-medium">Name</span>
            <input
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Email</span>
            <input
              type="email"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Role</span>
            <select
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Default currency</span>
            <select
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.defaultCurrencyId}
              onChange={(event) => setForm((current) => ({ ...current, defaultCurrencyId: event.target.value }))}
            >
              <option value="">Select currency</option>
              {currencies.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.name}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Verification status</span>
            <select
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none"
              value={form.emailVerified ? "verified" : "pending"}
              onChange={(event) => setForm((current) => ({ ...current, emailVerified: event.target.value === "verified" }))}
            >
              <option value="verified">Verified</option>
              <option value="pending">Pending verification</option>
            </select>
          </label>
          <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
