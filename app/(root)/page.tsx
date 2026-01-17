import Footer from "./_components/Footer";
import Heading from "./_components/Heading";
import Heros from "./_components/Heros";
import { Features } from "./_components/Features";
import { Pricing } from "./_components/Pricing";
import { Testimonials } from "./_components/Testimonials";
import { CTA } from "./_components/CTA";

 export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 scrollbar-hide">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-12 px-6 py-10 md:py-10">
        <Heading/>
        <Heros/>
      </div>

      {/* Features Section */}
      <Features />

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <CTA />

      {/* Footer */}
      <Footer/>
    </div>
  );
}
