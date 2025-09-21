'use client'

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

// Framer Motion variant
const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function AboutUs() {
    return (
        <div className="w-full bg-gray-50">
            <Header />

            {/* Hero Section */}
            <motion.section
                className="relative bg-gradient-to-r from-blue-700 to-teal-500 text-white py-28 px-10 text-center overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About Swift Campus Payment</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto">
                    A secure and efficient solution trusted by educational institutions to manage tuition and fee payments seamlessly.
                </p>
                <div className="mt-8">
                    <Link
                        href="/login"
                        className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow hover:shadow-lg transition"
                    >
                        Get Started
                    </Link>
                </div>
            </motion.section>

            {/* Mission Section */}
            <motion.section
                className="py-20 md:px-20 px-10 flex flex-col md:flex-row items-center gap-10 bg-gray-50"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <div className="md:w-1/2">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
                    <p className="text-gray-700 text-lg md:text-xl">
                        To simplify fee management for educational institutions while providing students a seamless and secure way to handle payments.
                    </p>
                </div>
                <div className="md:w-1/2 relative w-full h-64 md:h-80">
                    <Image src="/mission.jpg" alt="Mission" fill className="object-cover rounded-lg shadow-lg" />
                </div>
            </motion.section>

            {/* Vision Section */}
            <motion.section
                className="py-20 md:px-20 px-10 flex flex-col md:flex-row items-center gap-10 bg-gray-100"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <div className="md:w-1/2 order-2 md:order-1 relative w-full h-64 md:h-80">
                    <Image src="/vision.jpg" alt="Vision" fill className="object-cover rounded-lg shadow-lg" />
                </div>
                <div className="md:w-1/2 order-1 md:order-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Vision</h2>
                    <p className="text-gray-700 text-lg md:text-xl">
                        To become the leading campus payment platform that transforms financial operations, ensuring efficiency, security, and transparency.
                    </p>
                </div>
            </motion.section>

            {/* Core Values Section */}
            <motion.section
                className="py-20 md:px-20 px-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
                <div className="grid gap-8 md:grid-cols-3">
                    {[
                        { title: "Security", desc: "We protect all transactions and sensitive data with top-notch security standards." },
                        { title: "Efficiency", desc: "Streamlined payment processes save time and reduce administrative workload." },
                        { title: "Transparency", desc: "Clear reporting and tracking ensures accountability for all stakeholders." },
                    ].map((value, idx) => (
                        <motion.div
                            key={idx}
                            className="bg-white p-8 rounded-xl shadow-lg hover:scale-105 transition-transform"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeUp}
                        >
                            <h3 className="text-2xl font-bold text-teal-500 mb-3">{value.title}</h3>
                            <p className="text-gray-700">{value.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Team Section */}
            <motion.section
                className="py-20 md:px-20 px-10 bg-gray-50"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
                <div className="grid gap-12 md:grid-cols-3 text-center">
                    {[
                        { name: "Oladipupo Abdulrasaq Akorede", matric: "CS20230100690", img: "/male.jpg" },
                        { name: "Akinrinola Boluwatife Olayiwonuola", matric: "CS20230105373", img: "/female_avatar.jpg" },
                        { name: "Ajileye Samuel Ayodeji", matric: "CS20230100471", img: "/male.jpg" },
                    ].map((member, idx) => (
                        <motion.div
                            key={idx}
                            className="flex flex-col items-center bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeUp}
                        >
                            <div className="w-32 h-32 relative mb-4">
                                <Image
                                    src={member.img}
                                    alt={member.name}
                                    fill
                                    className="rounded-full object-cover border-4 border-teal-500"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                            <h3 className="text-lg font-medium text-gray-900">Computer Science ND II</h3>
                            <p className="text-teal-600 font-medium">{member.matric}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Call-to-Action */}
            <motion.section
                className="bg-blue-700 text-white text-center py-20 px-10 md:px-20"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Swift Community</h2>
                <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
                    Experience secure, efficient, and transparent campus payment management for your institution today.
                </p>
                <Link
                    href="/login"
                    className="bg-teal-500 text-white px-8 py-3 font-semibold rounded-lg hover:bg-teal-600 transition"
                >
                    Get Started
                </Link>
            </motion.section>

            <Footer />
        </div>
    );
}
