"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth";
import { FaAngleDown, FaArrowDown } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Sidebar() {
    const router = useRouter();
    const [dropdown, setDropdown] = useState(false)
    const [paymentDrop, setPaymentDrop] = useState(false)

    const sideLinks = [
        { name: "Profile", href: "/dashboard/profile" },]

    const registrationLinks = [
        { name: "Registration", href: "/dashboard/registration" },
        { name: "Course Registration", href: "/dashboard/courseRegistration" },
        { name: "Exams", href: "/dashboard" },
        { name: "Timetable", href: "/dashboard" },
    ]

    const paymentLinks = [
        { name: "Payments", href: "/dashboard/payment",},
        { name: "Payment History", href: "/dashboard/paymentHistory"}
    ]

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };


    return (
        <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-screen w-64 bg-blue-600 text-white flex flex-col">
            <div className="p-4 text-2xl md:mt-8 font-bold">Swift</div>
            <nav className="flex-1 px-4 space-y-2">
                <Link href={"/dashboard"} className={`block py-2 hover:bg-white hover:text-blue-700 text-semibold rounded px-2 `}>Dashboard</Link>
                <motion.ul
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.2 } },
                    }}

                    className="relative overflow-y-hidden">
                    <div className="px-2 flex items-center justify-between cursor-pointer" onClick={() => setDropdown(!dropdown)}>
                        <h3>Registration</h3>
                        <FaAngleDown />
                    </div>

                    {/*  */}
                    {dropdown && <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: .5 }}
                        className="bg-blue-700 rounded my-1"

                    >
                        {registrationLinks.map((link, index) => (
                            <li key={index} className="transition-all ease-in-out duration-300">
                                <Link href={link.href} className={`block py-2 hover:bg-white hover:text-blue-700 text-semibold rounded px-2 `}>{link.name}</Link>
                            </li>
                        ))}
                    </motion.div>}
                </motion.ul>
                {sideLinks.map((item, index) => (
                    <Link key={index} href={item.href} className={`block py-2 hover:bg-white hover:text-blue-700 text-semibold rounded px-2 `}>{item.name}</Link>
                ))}
                
                {/* dropdown menu */}

                {/* Start Payment links */}
                <motion.ul
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.2 } },
                    }}

                    className="relative overflow-y-hidden">
                    <div className="px-2 flex items-center justify-between cursor-pointer" onClick={() => setPaymentDrop(!paymentDrop)}>
                        <h3>Payments</h3>
                        <FaAngleDown />
                    </div>

                    {/*  */}
                    {paymentDrop && <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: .5 }}
                        className="bg-blue-700 rounded my-1"

                    >
                        {paymentLinks.map((link, index) => (
                            <li key={index} className="transition-all ease-in-out duration-300">
                                <Link href={link.href} className={`block py-2 hover:bg-white hover:text-blue-700 text-semibold rounded px-2 `}>{link.name}</Link>
                            </li>
                        ))}
                    </motion.div>}
                </motion.ul>

            </nav>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 p-3 m-4 rounded"
            >
                Logout
            </button>
        </motion.div>
    );
}
