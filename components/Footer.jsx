import Link from "next/link"
import { FaBolt } from "react-icons/fa"

export default function Footer() {
    return (
        <footer className="w-full py-6 px-10 md:px-20 flex flex-wrap items-center justify-between">
            <Link href={"/"} className='flex items-center text-2xl font-bold'><FaBolt />Swift</Link>

            <p className="line-break">All Rights Reserved | 2025</p>
        </footer>
    )
}