import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Approach } from "@/components/sections/Approach";
import { Services } from "@/components/sections/Services";
import { Gallery } from "@/components/sections/Gallery";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Approach />
        <Services />
        <Gallery />
      </main>
    </>
  );
}
