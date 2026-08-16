import { useState } from "react";
import type { Category } from "../types";

const SAMPLE_QUESTIONS: Record<Category, string> = {
  sports: "Did Team A win Match X on 2026-08-20?",
  crypto: "Was BTC >= $100,000 at 2026-08-20T00:00:00Z?",
};

export function QuestionForm({
  onSubmit,
}: {
  onSubmit: (category: Category, question: string) => void;
}) {
  const [category, setCategory] = useState<Category>("sports");
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS.sports);

  function handleCategoryChange(next: Category) {
    setCategory(next);
    setQuestion(SAMPLE_QUESTIONS[next]);
  }

  return (
    <div className="card">
      <h2>Create a market question</h2>
      <div className="category-toggle">
        <button
          className={category === "sports" ? "active" : ""}
          onClick={() => handleCategoryChange("sports")}
        >
          Sports
        </button>
        <button
          className={category === "crypto" ? "active" : ""}
          onClick={() => handleCategoryChange("crypto")}
        >
          Crypto
        </button>
      </div>

      <label htmlFor="question">Question</label>
      <textarea
        id="question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
      />

      <button className="primary" onClick={() => onSubmit(category, question)}>
        Submit for resolution
      </button>
    </div>
  );
}
