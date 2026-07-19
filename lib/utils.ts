import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function generateToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

type CsvRow = { name: string; email: string; status: string; respondedAt: Date };

export function buildCsv(rows: CsvRow[]): string {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const header = ["Name", "Email", "Status", "Responded At"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        escape(r.name),
        escape(r.email),
        escape(r.status),
        escape(new Date(r.respondedAt).toISOString()),
      ].join(",")
    ),
  ];
  return lines.join("\n");
}
