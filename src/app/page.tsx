import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Approach } from "@/components/sections/Approach";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Approach />
      </main>
    </>
  );
}
