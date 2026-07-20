import AffirmationMarquee from "@/components/AffirmationMarquee";
import AppPreview from "@/components/AppPreview";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Flipbook from "@/components/Flipbook";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Inside from "@/components/Inside";
import Letter from "@/components/Letter";
import Nav from "@/components/Nav";
import Order from "@/components/Order";
import Quotes from "@/components/Quotes";
import Rhythms from "@/components/Rhythms";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <AffirmationMarquee />
        <Letter />
        <Inside />
        <Rhythms />
        <Flipbook />
        <AppPreview />
        <Quotes />
        <Order />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
