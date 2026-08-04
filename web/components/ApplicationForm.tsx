"use client";

import { useState, type FormEvent } from "react";
import type { DepartmentCode } from "@/lib/portalApi";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Generic field set shared by all departments for now - answers is a
// flexible JSON column on department_applications specifically so this can
// be revised per department later without a schema change.
const FIELDS = [
  { name: "timezone", label: "What timezone are you in?" },
  { name: "experience", label: "What's your roleplay / emergency-services RP experience?" },
  { name: "availability", label: "How many hours a week can you commit?" },
  { name: "whyJoin", label: "Why do you want to join this department?" },
] as const;

type SubmitState = "idle" | "submitting" | "success" | "error";

const TEXTAREA_CLASSES =
  "mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-muted "
  + "focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500";

export function ApplicationForm({ departmentCode }: { departmentCode: DepartmentCode }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<SubmitState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: departmentCode, answers }),
      });
      setState(res.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <Card className="text-center text-sm text-muted">
        Application submitted. Staff will review it and reach out on Discord.
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="text-sm font-medium text-bone">
              {field.label}
            </label>
            <textarea
              id={field.name}
              required
              rows={3}
              className={TEXTAREA_CLASSES}
              value={answers[field.name] ?? ""}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [field.name]: event.target.value }))
              }
            />
          </div>
        ))}
        <button type="submit" disabled={state === "submitting"} className={buttonClasses("primary", "w-full")}>
          {state === "submitting" ? "Submitting..." : "Submit application"}
        </button>
        {state === "error" && <p className="text-sm text-red-400">Something went wrong — try again.</p>}
      </form>
    </Card>
  );
}
