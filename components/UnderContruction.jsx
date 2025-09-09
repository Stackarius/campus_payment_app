"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";

export default function UnderConstruction() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 text-gray-800 p-6">
            {/* Icon with bounce animation */}
            <motion.div
                className="p-8 bg-yellow-200 rounded-full shadow-lg"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <Construction className="w-20 h-20 text-yellow-700" />
            </motion.div>

            {/* Title */}
            <motion.h1
                className="mt-8 text-4xl md:text-5xl font-extrabold text-yellow-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                🚧 Page Under Construction 🚧
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                className="mt-4 text-lg md:text-xl text-gray-700 max-w-xl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
            >
                We’re building something awesome for you. Hang tight and check back soon!
            </motion.p>

            {/* Button back home */}
            <motion.a
                href="/"
                className="mt-8 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:bg-yellow-600 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
            >
                Back to Home
            </motion.a>
        </div>
    );
}
