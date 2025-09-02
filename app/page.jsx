'use client'

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaPlus, FaPercent } from "react-icons/fa";
import { motion } from "framer-motion";

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

// Framer Motion variants for scroll animations
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

// Reusable component for statistics
const StatCard = ({ value, label, icon }) => (
  <motion.div
    className="flex flex-col items-center gap-1 text-white"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeUp}
  >
    <h2 className="text-2xl md:text-3xl font-bold flex items-center">
      {value} {icon && <span className="inline mb-1">{icon}</span>}
    </h2>
    <p className="font-semibold">{label}</p>
  </motion.div>
);

// Reusable component for service/features section
const FeatureSection = ({ number, title, description, imageSrc }) => (
  <motion.div
    className="grid grid-cols-1 md:grid-cols-2 items-center px-10 md:px-20 py-10 gap-6"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    variants={fadeUp}
  >
    <div>
      <h3 className="font-semibold text-teal-500">{number}</h3>
      <h2 className="text-2xl md:text-3xl font-bold mt-1 text-gray-900">{title}</h2>
      {description && <p className="text-lg mt-2 text-gray-700">{description}</p>}
    </div>
    {imageSrc && (
      <picture>
        <img src={imageSrc} alt={title} className="w-80 h-80 md:ml-20 object-cover rounded-lg shadow-md" />
      </picture>
    )}
  </motion.div>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
    };
  }, []);

  return (
    <div className="w-full bg-gray-50" ref={heroRef}>
      <Header scrolled={scrolled} />
      <HeroSection />

      {/* Statistics Section */}
      <motion.section
        className="bg-blue-600 text-white text-center py-14 md:px-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <h2 className="text-3xl md:text-4xl font-bold capitalize">
          Trusted by Educational Institutions Worldwide
        </h2>
        <div className="grid gap-8 md:grid-cols-4 items-center mt-12">
          <StatCard value="60" icon={<FaPlus size={15} />} label="Departments" />
          <StatCard value="2.5k" icon={<FaPlus size={15} />} label="Schools" />
          <StatCard value="99.9" icon={<FaPercent size={15} />} label="System Uptime" />
          <StatCard value="A" icon={<FaPlus size={15} />} label="Security Rating" />
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="pt-16">
        <h2 className="text-center font-bold text-3xl md:text-4xl mb-8 text-gray-900">
          Why Swift Campus Payment System?
        </h2>

        <FeatureSection
          number="01"
          title="Seamless Payment Management"
          description="Automate and streamline tuition and fee payments, reducing manual processing for administrators and making it easier for students to pay securely online."
          imageSrc="/img_5.png"
        />

        <FeatureSection
          number="02"
          title="Effortless Record Tracking"
          description="Keep track of student payment history, generate invoices, and access detailed reports instantly to improve transparency and efficiency."
          imageSrc="/img_3.png"
        />

        <FeatureSection
          number="03"
          title="Enhanced Security & Compliance"
          description="Swift ensures all transactions are secure and compliant, with a robust system designed to protect sensitive student and institutional data."
          imageSrc="/img_4.jpg"
        />
      </section>

      {/* Call-to-Action Section */}
      <motion.section
        className="bg-gray-800 text-white py-16 md:px-20 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform Your Institution Today</h2>
        <p className="text-lg md:text-xl mb-6">
          Swift Campus Payment System simplifies fee management, improves operational efficiency, and ensures a seamless experience for both students and staff.
        </p>
        <Link
          href="/login"
          className="bg-teal-500 text-white px-8 py-3 font-semibold rounded-lg hover:bg-teal-600 transition"
        >
          Request a Demo
        </Link>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="py-16 px-10 md:px-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <ContactForm />
      </motion.section>

      <Footer />
    </div>
  );
}
