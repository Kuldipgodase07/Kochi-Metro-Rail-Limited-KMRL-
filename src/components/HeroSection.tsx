import landingVideo from "../Kochi_Metro_Landing_Page_Video_Creation.mp4";
import VisionMissionGoals from "./VisionMissionGoals";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={landingVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-hero-gradient opacity-80"></div>

      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-16">
        <div className="container mx-auto px-4">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight" 
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Welcome to Kochi Metro
            </h1>
            <p className="text-xl lg:text-2xl text-white font-medium font-serif tracking-wide mb-8"
               style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)' }}>
              Connecting People, Places & Possibilities
            </p>
          </div>

          {/* Vision Mission Goals Cards */}
          <VisionMissionGoals />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;