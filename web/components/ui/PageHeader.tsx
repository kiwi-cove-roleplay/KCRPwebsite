import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="space-y-3">
      <h1 className="text-3xl text-bone sm:text-4xl">{title}</h1>
      {children && <p className="max-w-2xl text-muted">{children}</p>}
    </header>
  );
}
