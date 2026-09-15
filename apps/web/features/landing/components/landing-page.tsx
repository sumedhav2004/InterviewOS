import { Footer } from "@/features/footer";
import { Navigation } from "@/features/navigation";
import { Hero } from "./hero";
import { CapabilityStrip } from "./capability-strip";
import { Problem } from "./problem";
import { Product } from "./product";
import { OneRoom } from "./one-room";
import { FinalCta } from "./final-cta";

export function LandingPage() {
  return (
    <main>
      <Navigation />
      <Hero />
      <CapabilityStrip />
      <Problem />
      <Product />
      <OneRoom />
      <FinalCta />
      <Footer />
    </main>
  );
}