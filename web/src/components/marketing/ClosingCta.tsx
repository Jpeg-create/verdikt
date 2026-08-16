export function ClosingCta() {
  return (
    <section className="closing-cta">
      <div>
        <h2 className="closing-cta__title">Resolve a question end to end</h2>
        <p className="closing-cta__detail">
          Submit, watch the pipeline, stake, finalize. Nothing to install.
        </p>
      </div>

      <div className="closing-cta__actions">
        <a className="button button--primary" href="#console">
          Open the console →
        </a>
        <a className="button button--ghost" href="#architecture">
          See the architecture
        </a>
      </div>
    </section>
  );
}
