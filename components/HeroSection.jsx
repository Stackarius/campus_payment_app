import React from 'react'
import Link from 'next/link'
import { FaAndroid, FaPercent, FaPercentage, FaPlus } from 'react-icons/fa'
import Image from 'next/image'

const HeroSection = () => {
    return (
        <div className='flex flex-wrap items-center justify-between px-[5%] md:px-20 pb-10 gap-4 md:gap-10 w-full'>
            <div className='pt-[50px] mx-auto md:mx-0 md:w-[50%]'>
                <h1 className='text-[30px] mb-4 md:text-[40px] mt-[6%] font-bold capitalize'>Transform Your Campus Payment with our complete Management Tools.</h1>
                <p className='text-sm md:text-lg my-2'>Swift is a comprehensive campus payment system that streamlines payment burdens with smart tools, expert insights and real growth through powerful integrated tools.</p>
                <div className='flex flex-wrap items-center justify-start  gap-3 my-3'>
                    <Link href={"/"} className="text-md text-white bg-pink-500 px-4 py-2 font-semibold rounded">Request Demo</Link>
                    <button>
                        <Link href={"/login"} className='bg-gray-800 items-center text-white font-semibold rounded px-4 py-3 shadow'><FaAndroid className='inline mr-2' size={30} />Explore Features</Link>
                    </button>
                </div>

                <div className='flex items-center my-10 gap-10'>

                    <div className='flex flex-col items-center gap-1'>
                        <h2 className='text-2xl md:text-3xl font-bold'>300<FaPlus className='inline text-pink-500 mb-1' size={15} /></h2>
                        <p className='opacity-60 font-semibold'>Schools</p>
                    </div>

                    <div className='flex flex-col items-center gap-1'>
                        <h2 className='text-2xl md:text-3xl font-bold'>1M<FaPlus className='inline text-pink-500 mb-1' size={15} /></h2>
                        <p className='opacity-60 font-semibold'>Users</p>
                    </div>

                    <div className='flex flex-col items-center gap-1'>
                        <h2 className='text-2xl md:text-3xl font-bold'>90<FaPercent className='inline text-pink-500 mb-1' size={15} /></h2>
                        <p className='opacity-60 font-semibold'>Satisfaction</p>
                    </div>
                </div>
            </div>
            <div className='h-[400px] w-100 rounded overflow-hidden md:mr-20 md:mt-20'>
  {/*               <Image
                    src={"/background.png"}
                    width={100}
                    height={100}
                    className='w-full h-full'
                    priority
                /> */}
                <picture>
                    <img src="/background.png" alt="" />
                </picture>
            </div>
        </div>
    )
}

export default HeroSection