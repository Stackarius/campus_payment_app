'use client'

import Link from 'next/link'
import React, {useState} from 'react'
import { FaAndroid, FaBolt,FaBars, FaTimes } from 'react-icons/fa'

const Header = ({scrolled}) => {

    const [isOpen, setOpen] = useState(false)

    const nav_links = [
        {name: "Home", href: "/"},
        {name: "Features", href: "/#features"},
        {name: "About", href: "/about"},
        {name: "Contact", href: "/contact"},
    ]
    return (
        <header className={`sticky top-0 left-0 flex items-center justify-between py-3 px-[5%] text-white bg-blue-600 ${scrolled ? "bg-gray-800" : ""} z-[99999]`}>
            <Link href={"/"} className='flex items-center text-2xl font-bold'><FaBolt />Swift</Link>

            {/* other links */}
            <div className="hidden sm:flex gap-6 transition-all duration-300">
                {nav_links.map((link, idx) => (
                    <Link
                        href={link.href}
                        key={idx}
                        className={`inline text-lg text-white px-5 py-2 mx-2 hover:text-gray-800 hover:bg-white rounded`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>

            <button
                className="sm:hidden bg-black p-1 rounded relative text-xl outline-none z-40 ransition-all duration-300 ease-in-out overflow-y-visible"
                onClick={() => setOpen(!isOpen)}
                aria-label="Toggle navigation"
            >
                {!isOpen ? <FaBars className='text-white' /> : <FaTimes className='text-white' />}
            </button>

            {/* Mobile Navigation */}
            {isOpen && <div className={`fixed flex flex-col items-center justify-center top-0 right-[100%] z-20 p-10 bg-gray-900 shadow-lg transition-all duration-300 ease-in-out sm:hidden ${isOpen ? 'w-full mx-w[400px] h-full left-[0%] opacity-100 transition-all duration-400 ease-in-out' : ' opacity-0'
                }`}>
                {nav_links.map((link, idx) => (
                    <Link
                        href={link.href}
                        key={idx}
                        className="inline text-lg text-white px-5 py-3 mx-2 hover:text-yellow-500"
                    >
                        {link.name}
                    </Link>
                ))}
            </div>}

            <button className='hidden md:block'>
                <Link href={"/"} className='bg-white items-center text-gray-800 font-semibold rounded px-4 py-2 shadow'><FaAndroid className='inline mr-2'/>Download App</Link>
            </button>
        </header>
    )
}

export default Header