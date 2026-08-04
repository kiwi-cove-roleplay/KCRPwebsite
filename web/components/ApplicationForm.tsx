"use client";

import { useState, type FormEvent } from "react";
import type { DepartmentCode } from "@/lib/portalApi";

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
    return <p>Application submitted. Staff will review it and reach out on Discord.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <br />
          <textarea
            id={field.name}
            required
            value={answers[field.name] ?? ""}
            onChange={(event) =>
              setAnswers((prev) => ({ ...prev, [field.name]: event.target.value }))
            }
          />
        </div>
      ))}
      <button type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting..." : "Submit application"}
      </button>
      {state === "error" && <p>Something went wrong — try again.</p>}
    </form>
  );
}
