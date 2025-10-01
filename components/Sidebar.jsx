"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "@/lib/auth";
import {
    FaAngleDown,
    FaUser,
    FaHome,
    FaBookOpen,
    FaChalkboardTeacher,
    FaCalendarAlt,
    FaMoneyBill,
    FaHistory,
    FaSignOutAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [dropdown, setDropdown] = useState(false);
    const [paymentDrop, setPaymentDrop] = useState(false);

    const sideLinks = [{ name: "Profile", href: "/dashboard/profile", icon: <FaUser /> }];

    const registrationLinks = [
        { name: "Registration", href: "/dashboard/registration", icon: <FaBookOpen /> },
        { name: "Course Registration", href: "/dashboard/courseRegistration", icon: <FaChalkboardTeacher /> },
        { name: "Exams", href: "/dashboard/exams", icon: <FaBookOpen /> },
        { name: "Timetable", href: "/dashboard/timetable", icon: <FaCalendarAlt /> },
    ];

    const paymentLinks = [
        { name: "Payments", href: "/dashboard/payment", icon: <FaMoneyBill /> },
        { name: "Payment History", href: "/dashboard/paymentHistory", icon: <FaHistory /> },
    ];

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    const linkClasses = (href) =>
        `flex items-center gap-2 py-2 px-2 rounded transition-colors duration-200 ${pathname === href
            ? "bg-white text-blue-700 font-bold shadow-sm"
            : "hover:bg-white hover:text-blue-700 text-white"
        }`;

    // Auto expand dropdowns if inside child path
    useEffect(() => {
        if (registrationLinks.some((link) => pathname.startsWith(link.href))) {
            setDropdown(true);
        }
        if (paymentLinks.some((link) => pathname.startsWith(link.href))) {
            setPaymentDrop(true);
        }
    }, [pathname]);

    return (
        <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-screen w-64 bg-blue-600 text-white flex flex-col"
        >
            <div className="p-4 text-2xl md:mt-8 font-bold">Swift</div>
            <nav className="flex-1 px-4 space-y-2">
                {/* Dashboard */}
                <Link href={"/dashboard"} className={linkClasses("/dashboard")}>
                    <FaHome /> Dashboard
                </Link>

                {/* Registration Dropdown */}
                <motion.ul className="relative overflow-y-hidden">
                    <div
                        className="px-2 flex items-center justify-between cursor-pointer"
                        onClick={() => setDropdown(!dropdown)}
                    >
                        <h3 className="flex items-center gap-2">
                            <FaBookOpen /> Registration
                        </h3>
                        <FaAngleDown
                            className={`transition-transform ${dropdown ? "rotate-180" : "rotate-0"}`}
                        />
                    </div>

                    {dropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-blue-700 rounded my-1"
                        >
                            {registrationLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className={linkClasses(link.href)}>
                                        {link.icon} {link.name}
                                    </Link>
                                </li>
                            ))}
                        </motion.div>
                    )}
                </motion.ul>

                {/* Profile */}
                {sideLinks.map((item, index) => (
                    <Link key={index} href={item.href} className={linkClasses(item.href)}>
                        {item.icon} {item.name}
                    </Link>
                ))}

                {/* Payment Dropdown */}
                <motion.ul className="relative overflow-y-hidden">
                    <div
                        className="px-2 flex items-center justify-between cursor-pointer"
                        onClick={() => setPaymentDrop(!paymentDrop)}
                    >
                        <h3 className="flex items-center gap-2">
                            <FaMoneyBill /> Payments
                        </h3>
                        <FaAngleDown
                            className={`transition-transform ${paymentDrop ? "rotate-180" : "rotate-0"}`}
                        />
                    </div>

                    {paymentDrop && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-blue-700 rounded my-1"
                        >
                            {paymentLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} className={linkClasses(link.href)}>
                                        {link.icon} {link.name}
                                    </Link>
                                </li>
                            ))}
                        </motion.div>
                    )}
                </motion.ul>
            </nav>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 p-3 m-4 rounded"
            >
                <FaSignOutAlt /> Logout
            </button>
        </motion.div>
    );
}
