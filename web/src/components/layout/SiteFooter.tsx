export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__col">
        <span className="site-footer__title">Verdikt</span>
        <span>contracts · oracle-engine · web</span>
        <span>Solidity, Hardhat, TypeScript, viem</span>
      </div>

      <nav className="site-footer__links" aria-label="Footer">
        <a href="#how">How it works</a>
        <a href="#guarantees">Guarantees</a>
        <a href="#architecture">Architecture</a>
        <a href="#faq">FAQ</a>
      </nav>

      <div className="site-footer__col site-footer__col--end">
        <span>Built for X Layer · Exchange OS</span>
        <span>Oracle interface · proposeResolution / finalize</span>
        <span>Demo mode — sample data only</span>
      </div>
    </footer>
  );
}
