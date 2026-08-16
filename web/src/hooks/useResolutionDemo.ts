import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_DISPUTE_WINDOW_SECONDS, STAKE_INCREMENT_OKB } from "../config";
import { pipelineEvents, resolveMock, SAMPLE_QUESTIONS } from "../mock/resolve";
import type {
  Category,
  MarketPhase,
  PipelineEvent,
  ResolutionStage,
  StakeSide,
  Verdict,
} from "../types";

export interface ResolutionDemo {
  category: Category;
  question: string;
  stage: ResolutionStage;
  log: PipelineEvent[];
  verdict: Verdict | null;
  /** The question text the current verdict was rendered against. */
  resolvedQuestion: string;
  phase: MarketPhase;
  yesStake: number;
  noStake: number;
  secondsRemaining: number;
  selectCategory: (category: Category) => void;
  setQuestion: (question: string) => void;
  submit: () => void;
  stake: (side: StakeSide) => void;
  propose: () => void;
  reset: () => void;
}

/**
 * Drives the client-side market lifecycle: question → evidence + AI pass →
 * verdict → stake → proposal → dispute window → settlement.
 */
export function useResolutionDemo(): ResolutionDemo {
  const [category, setCategory] = useState<Category>("sports");
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS.sports);
  const [stage, setStage] = useState<ResolutionStage>("idle");
  const [log, setLog] = useState<PipelineEvent[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [resolvedQuestion, setResolvedQuestion] = useState("");
  const [phase, setPhase] = useState<MarketPhase>("staking");
  const [yesStake, setYesStake] = useState(0);
  const [noStake, setNoStake] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Identifies the current run so a reset mid-flight discards its verdict.
  const runId = useRef(0);
  const logTimers = useRef<number[]>([]);

  const clearLogTimers = useCallback(() => {
    logTimers.current.forEach(window.clearTimeout);
    logTimers.current = [];
  }, []);

  useEffect(() => clearLogTimers, [clearLogTimers]);

  useEffect(() => {
    if (phase !== "dispute") return;
    if (secondsRemaining === 0) {
      setPhase("settled");
      return;
    }

    const timer = window.setTimeout(() => setSecondsRemaining((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, secondsRemaining]);

  const selectCategory = useCallback(
    (next: Category) => {
      if (stage === "resolving") return;
      setCategory(next);
      setQuestion(SAMPLE_QUESTIONS[next]);
    },
    [stage],
  );

  const submit = useCallback(async () => {
    const run = ++runId.current;
    clearLogTimers();

    setStage("resolving");
    setLog([]);
    setVerdict(null);
    setPhase("staking");
    setSecondsRemaining(0);

    for (const event of pipelineEvents(category)) {
      logTimers.current.push(
        window.setTimeout(() => setLog((lines) => [...lines, event]), event.at),
      );
    }

    const result = await resolveMock(category);
    if (runId.current !== run) return;

    setVerdict(result);
    setResolvedQuestion(question);
    setStage("resolved");
  }, [category, clearLogTimers, question]);

  const stake = useCallback((side: StakeSide) => {
    const add = (amount: number) => amount + STAKE_INCREMENT_OKB;
    if (side === "yes") setYesStake(add);
    else setNoStake(add);
  }, []);

  const propose = useCallback(() => {
    setSecondsRemaining(DEMO_DISPUTE_WINDOW_SECONDS);
    setPhase("dispute");
  }, []);

  const reset = useCallback(() => {
    runId.current += 1;
    clearLogTimers();

    setStage("idle");
    setLog([]);
    setVerdict(null);
    setResolvedQuestion("");
    setPhase("staking");
    setYesStake(0);
    setNoStake(0);
    setSecondsRemaining(0);
  }, [clearLogTimers]);

  return {
    category,
    question,
    stage,
    log,
    verdict,
    resolvedQuestion,
    phase,
    yesStake,
    noStake,
    secondsRemaining,
    selectCategory,
    setQuestion,
    submit,
    stake,
    propose,
    reset,
  };
}
