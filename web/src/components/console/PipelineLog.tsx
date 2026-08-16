import { Panel } from "../Panel";
import type { PipelineEvent } from "../../types";

interface PipelineLogProps {
  log: PipelineEvent[];
  resolving: boolean;
}

export function PipelineLog({ log, resolving }: PipelineLogProps) {
  return (
    <Panel
      label="Pipeline log"
      status={log.length > 0 ? `${log.length} events` : "—"}
      bodyClassName="pipeline"
    >
      {log.length === 0 ? (
        <p className="pipeline__idle">$ awaiting submission…</p>
      ) : (
        <ol className="pipeline__lines" aria-live="polite">
          {log.map((event) => (
            <li key={event.at} className="pipeline__line">
              <span className="pipeline__time">{event.time}</span>
              <span className={`pipeline__tag is-${event.tag}`}>{event.tag}</span>
              <span className="pipeline__message">{event.message}</span>
            </li>
          ))}
        </ol>
      )}

      {resolving ? <div className="pipeline__progress" aria-hidden="true" /> : null}
    </Panel>
  );
}
