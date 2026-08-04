import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl text-bone">{title}</h1>
      {children && <p className="text-muted">{children}</p>}
    </header>
  );
}
