import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import RouteSection from "@/components/landing/RouteSection";
import MediaSection from "@/components/landing/MediaSection";
import MetroFooter from "@/components/landing/MetroFooter";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <StatsSection />
      <RouteSection />
      <MediaSection />
      <MetroFooter />
      <Footer />
    </div>
  );
};

export default LandingPage;