'use client'

import { useState } from "react";

export default function PaymentPage() {

    const fee = [
        "Select payment type",
        "Departmental Levy",
        "Reparation Fee",
        "Student Union Levy",
        "Tution Fee",
    ]

    const [profile, setProfile] = useState({
        fullname: "",
        email: "",
        matric_no: "",
        school: ""
    })

    const handleChange = (e) => {
        setProfile((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault() 

        
     }
    
    return (
        <div className="p-6 space-y-8">
            <h1 className="text-3xl font-bold">Payment</h1>
            {/*  */}
            <form>
                <form onSubmit={handleSubmit} className="bg-gray-100 px-4 py-4 mt-6 rounded w-full md:w-[500px]">
                    {/* Name */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="fullname" className='font-semibold'>Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={profile.fullname}
                            readOnly
                            className="w-full p-1 border rounded mb-4" />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label htmlFor="matric" className='font-semibold'>Email</label>
                        <input
                            type="text"
                            name="matric"
                            id="matric"
                            value={profile.email}
                            readOnly
                            className="w-full p-1 border rounded mb-4" />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label htmlFor="matric" className='font-semibold'>Matric No</label>
                        <input
                            type="text"
                            name="matric"
                            id="matric"
                            value={profile.matric_no}
                            readOnly
                            className="w-full p-1 border rounded mb-4" />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label htmlFor="department" className='font-semibold'>Payment Type</label>
                        <select id="department" className='border p-1 rounded mb-4'>
                            {fee.map((f, index) => (
                                <option key={index} value={f} onChange={handleChange}>{f}</option>
                            ))}
                        </select>
                    </div>

                    <p className="text-md font-semibold text-gray-800">{ amount }</p>

                    <button className='block bg-blue-600 text-white font-semibold text-md rounded shadow px-4 py-2 ml-auto'>Pay Now</button>
                </form>
            </form>
        </div>
    )
}