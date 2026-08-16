import { Panel } from "../Panel";
import type { Category, ResolutionStage } from "../../types";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "sports", label: "Sports" },
  { id: "crypto", label: "Crypto" },
];

interface QuestionPanelProps {
  category: Category;
  question: string;
  questionId: string;
  stage: ResolutionStage;
  onSelectCategory: (category: Category) => void;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
}

export function QuestionPanel({
  category,
  question,
  questionId,
  stage,
  onSelectCategory,
  onQuestionChange,
  onSubmit,
}: QuestionPanelProps) {
  const resolving = stage === "resolving";

  return (
    <Panel
      label="01 · Question"
      status={stage === "idle" ? "ready" : "submitted"}
      statusTone={stage === "idle" ? "idle" : "done"}
    >
      <div className="segmented" role="group" aria-label="Question category">
        {CATEGORIES.map((option) => (
          <button
            key={option.id}
            type="button"
            className={option.id === category ? "segmented__option is-selected" : "segmented__option"}
            aria-pressed={option.id === category}
            onClick={() => onSelectCategory(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="market-question">
        Market question
      </label>
      <textarea
        id="market-question"
        className="field-input"
        rows={3}
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
      />

      <p className="field-meta">
        <span>resolution criteria: binary YES / NO</span>
        <span>id {questionId}</span>
      </p>

      <button type="button" className="button button--primary button--block" disabled={resolving} onClick={onSubmit}>
        {resolving ? "Resolving…" : "Submit for resolution →"}
      </button>
    </Panel>
  );
}
