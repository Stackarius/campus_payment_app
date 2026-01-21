'use client';

import MerchantForm from '@/components/MerchantForm';
import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useState } from 'react'

export default function MerchantPage() {
    const [merchants, setMerchants] = useState([])
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMerchants();
    }, []);

    const fetchMerchants = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('merchants')
            .select('id, fullname, business_name, account_no, service_type').order('id', { ascending: false });

        if (error) {
            toast.error('Failed to fetch merchant details');
            setMerchants([]);
            setLoading(false);
            return;
        }

        setMerchants(data ?? []);
        setLoading(false);
    };


    const handleForm = () => {
        // show/hide formm
        setShowForm(!showForm);


    }
    return (
        <>
            <section className='p-6'>
                <div className='flex items-center justify-between'>
                    <h2 className='font-bold text-2xl mb-8'>
                        Merchants
                    </h2>
                    {/* Show add merchant form */}
                    <button className='bg-blue-700 p-2 text-white rounded-md font-semibold cursor-pointer' onClick={handleForm}>Add Merchant</button>

                </div>

                {showForm && (
                    <MerchantForm onClose={() => setShowForm(false)} />
                )}


                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className="bg-gray-50 border-b">

                            <tr>
                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>ID</th>
                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Fullname</th>
                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Business Name</th>
                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Service Type</th>
                                <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>Account Number</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="text-gray-600">Loading Merchants...</span>
                                        </div>
                                    </td>
                                </tr>
                            )
                                :
                                merchants.length == 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center">
                                            <div className="text-gray-500">
                                                <p className="text-lg font-medium">No Merchant found</p>
                                                <p className="text-sm">Try adjusting your filters or search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) :
                                    (merchants.map((merchant, index) => (
                                        <tr key={merchant.id}>
                                            <td className='px-4 py-3'>
                                                <span className='text-sm'>
                                                    <p className='font-medium text-gray-900'>{index}</p>
                                                </span>
                                            </td>
                                            <td className='px-4 py-3'>
                                                <span className='text-sm'>
                                                    <p className='font-medium text-gray-900'>{merchant?.fullname}</p>
                                                </span>
                                            </td>
                                            <td className='px-4 py-3'>
                                                <span className='text-sm'>
                                                    <p className='font-medium text-gray-900'>{merchant?.business_name}</p>
                                                </span>
                                            </td>
                                            <td className='px-4 py-3'>
                                                <span className='text-sm'>
                                                    <p className='font-medium text-gray-900'>{merchant?.service_type}</p>
                                                </span>
                                            </td>
                                            <td className='px-4 py-3'>
                                                <span className='text-sm'>
                                                    <p className='font-medium text-gray-900'>{merchant?.account_no}</p>
                                                </span>
                                            </td>
                                        </tr>
                                    )))}
                        </tbody>
                    </table>
                </div>

            </section>
        </>
    )
}
