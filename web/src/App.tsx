import { useState } from "react";
import { QuestionForm } from "./components/QuestionForm";
import { VerdictCard } from "./components/VerdictCard";
import { MarketDemo } from "./components/MarketDemo";
import { resolveMock } from "./mock/resolve";
import type { Category, Verdict } from "./types";

type Stage = "form" | "resolving" | "verdict" | "market";

export default function App() {
  const [stage, setStage] = useState<Stage>("form");
  const [category, setCategory] = useState<Category>("sports");
  const [question, setQuestion] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  async function handleSubmit(cat: Category, q: string) {
    setCategory(cat);
    setQuestion(q);
    setStage("resolving");

    // Simulated latency for evidence gathering + AI resolution pass.
    const result = await resolveMock(cat, q);
    setVerdict(result);
    setStage("verdict");
  }

  return (
    <div className="app">
      <header>
        <h1>Verdikt</h1>
        <p className="tagline">
          An AI-verified outcome oracle for X Layer Exchange OS outcome markets.
        </p>
        <p className="mock-banner">
          Demo mode — this walkthrough runs entirely client-side on canned data.
          No wallet, funds, or API key required.
        </p>
      </header>

      {stage === "form" && <QuestionForm onSubmit={handleSubmit} />}

      {stage === "resolving" && (
        <div className="card">
          <p>Gathering evidence and running AI resolution…</p>
        </div>
      )}

      {stage === "verdict" && verdict && (
        <VerdictCard
          category={category}
          question={question}
          verdict={verdict}
          onContinue={() => setStage("market")}
        />
      )}

      {stage === "market" && verdict && (
        <MarketDemo verdict={verdict} onReset={() => setStage("form")} />
      )}
    </div>
  );
}
