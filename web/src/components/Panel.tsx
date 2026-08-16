import type { ReactNode } from "react";

export type StatusTone = "idle" | "active" | "pending" | "done";

interface PanelProps {
  /** Monospace label in the panel head, e.g. "01 · Question". */
  label: string;
  status?: string;
  statusTone?: StatusTone;
  /** Draws the panel border in the verdict colour once a resolution has landed. */
  resolved?: boolean;
  bodyClassName?: string;
  children: ReactNode;
}

export function Panel({
  label,
  status,
  statusTone = "idle",
  resolved = false,
  bodyClassName,
  children,
}: PanelProps) {
  return (
    <section className={resolved ? "panel panel--resolved" : "panel"}>
      <header className="panel__head">
        <span className="panel__label">{label}</span>
        {status ? <span className={`panel__status is-${statusTone}`}>{status}</span> : null}
      </header>
      <div className={bodyClassName ? `panel__body ${bodyClassName}` : "panel__body"}>
        {children}
      </div>
    </section>
  );
}
