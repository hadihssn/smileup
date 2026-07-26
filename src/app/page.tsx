import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Approach } from "@/components/sections/Approach";
import { Services } from "@/components/sections/Services";
import { Gallery } from "@/components/sections/Gallery";
import { Dentist } from "@/components/sections/Dentist";
import { Testimonials } from "@/components/sections/Testimonials";
import { ClinicInfo } from "@/components/sections/ClinicInfo";
import { Booking } from "@/components/sections/Booking";
import { Faq } from "@/components/sections/Faq";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Approach />
        <Services />
        <Gallery />
        <Dentist />
        <Testimonials />
        <ClinicInfo />
        <Booking />
        <Faq />
      </main>
    </>
  );
}
