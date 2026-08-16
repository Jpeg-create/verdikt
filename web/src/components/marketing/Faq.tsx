const QUESTIONS = [
  {
    question: "What happens when the AI gets it wrong?",
    answer:
      "The proposal is not the verdict. It sits in the dispute window, and a challenged proposal never finalizes. The committed evidence hash means the inputs it read can be checked, not guessed at.",
  },
  {
    question: "What if the evidence disagrees?",
    answer:
      "Confidence falls below the threshold and the question comes back unresolved instead of resolved wrongly. A market would rather wait than settle on a coin flip.",
  },
  {
    question: "Why not use a price feed?",
    answer:
      "Exchange OS outcome markets resolve events, not prices — the whitepaper puts resolution in the hands of designated third-party oracle providers, and pre-integrates none.",
  },
  {
    question: "What is mocked in this build?",
    answer:
      "The evidence, the AI pass and the chain calls. The flow, the confidence scoring and the pro-rata payout math are the real design.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="section">
      <h2 className="eyebrow">FAQ</h2>
      <dl className="faq-grid">
        {QUESTIONS.map((entry) => (
          <div key={entry.question} className="faq-item">
            <dt>{entry.question}</dt>
            <dd>{entry.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
