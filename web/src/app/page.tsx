import { ResolutionConsole } from "../components/console/ResolutionConsole";
import { SiteFooter } from "../components/layout/SiteFooter";
import { SiteHeader } from "../components/layout/SiteHeader";
import { Architecture } from "../components/marketing/Architecture";
import { ClosingCta } from "../components/marketing/ClosingCta";
import { Faq } from "../components/marketing/Faq";
import { Guarantees } from "../components/marketing/Guarantees";
import { Hero } from "../components/marketing/Hero";
import { HowItWorks } from "../components/marketing/HowItWorks";
import { WhyThirdParty } from "../components/marketing/WhyThirdParty";

export default function Page() {
  return (
    <div className="app">
      <SiteHeader />
      <div className="page">
        <main>
          <Hero />
          <WhyThirdParty />
          <HowItWorks />
          <ResolutionConsole />
          <Guarantees />
          <Architecture />
          <Faq />
          <ClosingCta />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
