const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#console", label: "Console" },
  { href: "#architecture", label: "Architecture" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__brand">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">Verdikt</span>
        <span className="brand-tag">X Layer · Exchange OS</span>
      </div>

      <div className="site-header__end">
        <nav className="site-nav" aria-label="Sections">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <p className="demo-flag">
          <span className="demo-flag__dot" aria-hidden="true" />
          Demo mode — sample data
        </p>
      </div>
    </header>
  );
}
