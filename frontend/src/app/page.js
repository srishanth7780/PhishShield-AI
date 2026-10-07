import Navbar from "../components/Navbar";
import BackgroundVideo from "../components/BackgroundVideo";
import HeroSection from "../components/HeroSection";
import ScamDetector from "../components/ScamDetector";
import CtaFooter from "../components/CtaFooter";
import CyberChatbot from "../components/CyberChatbot";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white font-body">
      <BackgroundVideo />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <ScamDetector />
      </main>
      <div className="relative z-10">
        <CtaFooter />
      </div>
      <CyberChatbot />
    </div>
  );
}




