"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LinkIcon,
  Copy,
  Check,
  Trash2,
  Users,
  Mail,
  Clock,
  Pencil,
  CopyPlus,
  Download,
} from "lucide-react";
import type { RsvpStatus } from "@prisma/client";

type Rsvp = {
  id: string;
  name: string;
  email: string;
  status: RsvpStatus;
  respondedAt: Date;
};

type EventDetail = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  eventDate: Date | null;
  createdAt: Date;
  invite: { token: string; id: string } | null;
  rsvps: Rsvp[];
};

export default function EventDetailContent({ event }: { event: EventDetail }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [inviteToken, setInviteToken] = useState(event.invite?.token || null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const inviteUrl = inviteToken
    ? `${window.location.origin}/invite/${inviteToken}`
    : "";

  async function handleCreateInvite() {
    startTransition(async () => {
      const res = await fetch(`/api/events/${event.id}/invite`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.token) {
        setInviteToken(data.token);
      }
    });
  }

  async function copyToClipboard() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDeleteRsvp(rsvpId: string) {
    if (!confirm("Remove this RSVP?")) return;
    setDeletingId(rsvpId);
    await fetch(`/api/events/${event.id}/rsvps/${rsvpId}`, {
      method: "DELETE",
    });
    window.location.reload();
  }

  async function handleDuplicate() {
    if (!confirm("Duplicate this event?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/events/${event.id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/events/${data.eventId}`);
      } else {
        toast.error("Could not duplicate event");
      }
    });
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/export`);
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}-rsvps.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("RSVP list exported");
    } catch {
      toast.error("Could not export RSVPs");
    } finally {
      setExporting(false);
    }
  }

  async function handleEdit(formData: FormData) {
    const res = await fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        eventDate: formData.get("eventDate"),
      }),
    });
    if (res.ok) {
      setEditing(false);
      router.refresh();
      toast.success("Event updated");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not update event");
    }
  }

  const statusColors: Record<string, string> = {
    going: "bg-green-500/10 text-green-400 border-green-500/20",
    maybe: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    not_going: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Event Details Card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        {editing ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await handleEdit(fd);
            }}
            className="space-y-4"
          >
            <input
              name="title"
              defaultValue={event.title}
              required
              minLength={3}
              maxLength={120}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <textarea
              name="description"
              defaultValue={event.description ?? ""}
              rows={3}
              maxLength={2000}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
            />
            <input
              name="location"
              defaultValue={event.location ?? ""}
              maxLength={200}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <input
              name="eventDate"
              type="datetime-local"
              defaultValue={
                event.eventDate
                  ? new Date(event.eventDate).toISOString().slice(0, 16)
                  : ""
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white [color-scheme:dark] focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-violet-500"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                {event.description && (
                  <p className="text-white/60 mb-4 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                  title="Edit event"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={handleDuplicate}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white disabled:opacity-50"
                  title="Duplicate event"
                >
                  <CopyPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Duplicate</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/50">
              {event.eventDate && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-violet-400" />
                  <span>
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-violet-400" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Invite Section */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Invite Link</h2>
        </div>

        {inviteToken ? (
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 font-mono truncate">
              {inviteUrl}
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-violet-500 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={handleCreateInvite}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-violet-500 disabled:opacity-50"
          >
            <LinkIcon className="h-4 w-4" />
            {isPending ? "Generating..." : "Generate Invite Link"}
          </button>
        )}
      </div>

      {/* RSVPs Section */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">
              RSVPs ({event.rsvps.length})
            </h2>
          </div>
          {event.rsvps.length > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>

        {event.rsvps.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-8">
            No RSVPs yet. Share your invite link!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-left font-medium text-white/50">
                    Name
                  </th>
                  <th className="pb-3 text-left font-medium text-white/50 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="pb-3 text-left font-medium text-white/50">
                    Status
                  </th>
                  <th className="pb-3 text-left font-medium text-white/50 hidden sm:table-cell">
                    Responded
                  </th>
                  <th className="pb-3 text-right font-medium text-white/50"></th>
                </tr>
              </thead>
              <tbody>
                {event.rsvps.map((rsvp) => (
                  <tr
                    key={rsvp.id}
                    className="border-b border-white/5 group hover:bg-white/5 transition-colors duration-150"
                  >
                    <td className="py-3 text-white font-medium">{rsvp.name}</td>
                    <td className="py-3 text-white/50 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        {rsvp.email}
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${statusColors[rsvp.status]}`}
                      >
                        {rsvp.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-white/40 text-xs hidden sm:table-cell">
                      {new Date(rsvp.respondedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteRsvp(rsvp.id)}
                        disabled={deletingId === rsvp.id}
                        className="rounded p-1 text-white/20 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RSVP Summary */}
        {event.rsvps.length > 0 && (
          <div className="mt-6 flex gap-4 border-t border-white/10 pt-4">
            <div className="flex-1 rounded-lg bg-green-500/5 border border-green-500/10 p-3 text-center">
              <div className="text-lg font-bold text-green-400">
                {event.rsvps.filter((r) => r.status === "going").length}
              </div>
              <div className="text-xs text-green-400/60">Going</div>
            </div>
            <div className="flex-1 rounded-lg bg-yellow-500/5 border border-yellow-500/10 p-3 text-center">
              <div className="text-lg font-bold text-yellow-400">
                {event.rsvps.filter((r) => r.status === "maybe").length}
              </div>
              <div className="text-xs text-yellow-400/60">Maybe</div>
            </div>
            <div className="flex-1 rounded-lg bg-red-500/5 border border-red-500/10 p-3 text-center">
              <div className="text-lg font-bold text-red-400">
                {event.rsvps.filter((r) => r.status === "not_going").length}
              </div>
              <div className="text-xs text-red-400/60">Not Going</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
