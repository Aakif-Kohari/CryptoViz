import { notFound } from "next/navigation";

export function requireDevelopment() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
}