'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function ContactUs() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement backend submission here
        console.log(formData);
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <div className="w-full bg-gray-50">
            <Header />

            {/* Hero */}
            <motion.section
                className="bg-gradient-to-r from-blue-700 to-teal-500 text-white text-center py-24 px-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto">
                    Have questions or need support? Reach out to our team, and we'll get back to you promptly.
                </p>
            </motion.section>

            {/* Contact Form & Map */}
            <motion.section
                className="py-20 md:px-20 px-10 grid grid-cols-1 md:grid-cols-2 gap-12"
                initial=""
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                {/* Form */}
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {submitted && (
                        <p className="mb-4 text-green-600 font-semibold">
                            Thank you! Your message has been sent.
                        </p>
                    )}
                    <h2 className="font-semibold my-3 text-2xl">Send A Message</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            required
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Your Email"
                            required
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Your Message"
                            required
                            rows={6}
                            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                        >
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Google Map */}
                <div className="rounded-xl overflow-hidden shadow-lg">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1976.942826237294!2d4.4161516!3d7.6954192!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10382b2523ce295d%3A0x3890e02308982a69!2sFederal%20polytechnic%20Ede%20South%20Campus!5e0!3m2!1sen!2sng!4v1756512242492!5m2!1sen!2sng"
                        width="600"
                        height="450"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </motion.section>

            {/* Call-to-Action */}
            <motion.section
                className="bg-blue-700 text-white text-center py-16 px-10 md:px-20"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Assistance?</h2>
                <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
                    Our support team is ready to help you. Contact us today!
                </p>
                <a
                    href="mailto:support@swiftcampus.com"
                    className="bg-teal-500 text-white px-8 py-3 font-semibold rounded-lg hover:bg-teal-600 transition"
                >
                    Email Support
                </a>
            </motion.section>

            <Footer />
        </div>
    );
}
