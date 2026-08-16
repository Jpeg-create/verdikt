"use client";

import { ENGINE_VERSION } from "../../config";
import { useResolutionDemo } from "../../hooks/useResolutionDemo";
import { EVIDENCE_HASHES, QUESTION_IDS } from "../../mock/resolve";
import { ContractCall } from "./ContractCall";
import { DemoMarket } from "./DemoMarket";
import { PipelineLog } from "./PipelineLog";
import { QuestionPanel } from "./QuestionPanel";
import { TrustSurface } from "./TrustSurface";
import { VerdictPanel } from "./VerdictPanel";

export function ResolutionConsole() {
  const demo = useResolutionDemo();

  return (
    <section id="console" className="section section--flush">
      <header className="console__head">
        <h2 className="section__title section__title--inline">Resolution console</h2>
        <p className="console__meta">
          engine v{ENGINE_VERSION} · mock fixtures · latency simulated
        </p>
      </header>

      <div className="console__grid">
        <div className="console__column">
          <QuestionPanel
            category={demo.category}
            question={demo.question}
            questionId={QUESTION_IDS[demo.category]}
            stage={demo.stage}
            onSelectCategory={demo.selectCategory}
            onQuestionChange={demo.setQuestion}
            onSubmit={demo.submit}
          />
          <PipelineLog log={demo.log} resolving={demo.stage === "resolving"} />
        </div>

        <div className="console__column">
          <VerdictPanel
            verdict={demo.verdict}
            category={demo.category}
            question={demo.resolvedQuestion}
            resolving={demo.stage === "resolving"}
          />
          <ContractCall
            verdict={demo.verdict}
            questionId={QUESTION_IDS[demo.category]}
            evidenceHash={EVIDENCE_HASHES[demo.category]}
            phase={demo.phase}
          />
        </div>

        <div className="console__column">
          <DemoMarket
            verdict={demo.verdict}
            phase={demo.phase}
            yesStake={demo.yesStake}
            noStake={demo.noStake}
            secondsRemaining={demo.secondsRemaining}
            onStake={demo.stake}
            onPropose={demo.propose}
            onReset={demo.reset}
          />
          <TrustSurface />
        </div>
      </div>
    </section>
  );
}
