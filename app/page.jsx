'use client'

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { FaPlus, FaPercent, } from "react-icons/fa";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useRef, useState, useEffect } from "react";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
    };
  }, []);

  return (
    <div className="w-[100%] bg-pink-50" ref={heroRef}>
      <Header scrolled={scrolled} />
      <HeroSection />
      {/*  */}
      <div className="bg-pink-500 text-center text-white md:px-20 py-10">
        <h2 className="text-3xl font-bold capitalize">Trusted by students worldwide</h2>
        <div className='grid gap-8 md:grid-cols-4 items-center mt-10 px-10'>

          <div className='flex flex-col items-center gap-1'>
            <h2 className='text-2xl md:text-3xl font-bold'>60<FaPlus className='inline mb-1' size={15} /></h2>
            <p className='font-semibold'>Departments</p>
          </div>

          <div className='flex flex-col items-center gap-1'>
            <h2 className='text-2xl md:text-3xl font-bold'>2.5k<FaPlus className='inline mb-1' size={15} /></h2>
            <p className='font-semibold'>Schools</p>

          </div>

          <div className='flex flex-col items-center gap-1'>
            <h2 className='text-2xl md:text-3xl font-bold'>99.9<FaPercent className='inline mb-1' size={15} /></h2>
            <p className='font-semibold'>Uptime</p>
          </div>

          <div className='flex flex-col items-center gap-1'>
            <h2 className='text-2xl md:text-3xl font-bold'>A<FaPlus className='inline mb-1' size={15} /></h2>
            <p className='font-semibold'>Security Rating</p>
          </div>

        </div>
      </div>
      {/*  */}
      <div className="pt-10" id="services">
        <h2 className="text-center font-bold text-2xl md:text-3xl">Why Choose Swift?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 items-start px-10 md:px-20 py-10">
          <div>
            <h3 className="font-semibold">01.</h3>
            <h2 className="text-2xl font-bold">Streamline Payment,<br />Enhance Productivity</h2>
          </div>

          {/*  */}
          <div>
            <p className='text-lg my-2'>Swift is a comprehensive campus payment system that streamlines payment burdens with smart tools, expert insights and real growth through powerful integrated tools.</p>
            <picture>
              <img src="/img_2.png"
                alt="Demo mockup"
                className=""
              />
            </picture>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 text-white md:px-20 py-10">
        <div className='grid md:grid-cols-2 items-center justify-between mt-10 px-10 '>
          {/*  */}
          <div className="">
            <h2 className='text-2xl md:text-3xl font-bold'>Transform Your Education Institution</h2>
            <p className='text-md md:text-lg my-2'>Swift is a comprehensive campus payment system that streamlines payment burdens with smart tools, expert insights and real growth through powerful integrated tools.</p>
          </div>
          {/*  */}
          <Link className="bg-pink-500 text-center md:w-fit md:ml-[50%] my-3 text-white px-4 py-1 text-xl font-semibold rounded" href={'/'}>Request Demo</Link>
        </div>
      </div>

      {/*  */}
      <div className="py-10">
        <ContactForm/>
      </div>

      {/*  */}
      <Footer />
    </div>

  );
}
