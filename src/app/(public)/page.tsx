import { Header } from '@/components/layout';
import {
  HeroSlider,
  StatsOverlap,
  QuickNavCards,
  AboutAndVision,
  BusinessScope,
  FleetTypesShowcase,
  RecruitmentPipeline,
  QualificationsBento,
  WhyChooseUs,
  MaritimeFAQ,
  LegalModalViewer,
  PartnerMarquee,
  SplitCTA,
  Footer,
} from '@/components/home';
import { MobileActionDock } from '@/components/layout';

export default function HomePage() {
  return (
    <>
      {/* Header contains TopBar internally (collapsible on scroll) */}
      <Header />
      <main>
        {/* 1. Hero Highlight Slider */}
        <section id="hero">
          <HeroSlider />
        </section>

        {/* 2. Floating Stats Overlap */}
        <StatsOverlap />

        {/* 3. Dual-Audience Quick Navigation */}
        <QuickNavCards />

        {/* 4. Company Profile, Mandate & 4 Mission Pillars */}
        <AboutAndVision />

        {/* 5. Business Scope - 4 Services */}
        <BusinessScope />

        {/* 6. Commercial Fleet Specialization */}
        <FleetTypesShowcase />

        {/* 7. Recruitment Pipeline - 9 Stages */}
        <RecruitmentPipeline />

        {/* 8. Seafarer Qualifications & Core Values Bento */}
        <QualificationsBento />

        {/* 9. Why Choose Us - 6 Pillars */}
        <WhyChooseUs />

        {/* 10. Maritime Compliance & Operational FAQ */}
        <MaritimeFAQ />

        {/* 11. Legal Credentials Showcase */}
        <LegalModalViewer />

        {/* 12. International Standards Marquee */}
        <PartnerMarquee />

        {/* 13. Split CTA Banner */}
        <SplitCTA />
      </main>

      {/* 11. Multi-Column Maritime Footer */}
      <Footer />

      {/* 12. Mobile Quick Action Dock (fixed bottom, mobile only) */}
      <MobileActionDock />
    </>
  );
}
