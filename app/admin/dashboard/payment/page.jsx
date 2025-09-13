'use client'

import { useState, useEffect } from "react"

export default function AllPayment() {
    const [payments, setPayments] = useState([])
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalRecords: 0,
        hasNext: false,
        hasPrev: false
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    // Query params
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc",
        search: "",
        type: "",
        dateFrom: "",
        dateTo: ""
    })

    // Fetch payments when filters change
    useEffect(() => {
        fetchPayments()
    }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder])

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (filters.page !== 1) {
                setFilters(prev => ({ ...prev, page: 1 }))
            } else {
                fetchPayments()
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [filters.search, filters.type, filters.dateFrom, filters.dateTo])

    const fetchPayments = async () => {
        setLoading(true)
        setError("")
        
        try {
            const queryParams = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value)
            })

            const response = await fetch(`/api/fetchPayment?${queryParams.toString()}`)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || "Failed to fetch payments")
            }
            
            setPayments(data.payments || [])
            setPagination(data.pagination || {
                page: 1,
                totalPages: 1,
                totalRecords: 0,
                hasNext: false,
                hasPrev: false
            })
        } catch (err) {
            console.error("Error fetching payments:", err)
            setError(err.message || "Failed to load payments. Please try again.")
            setPayments([])
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            // Reset to page 1 when changing filters (except pagination)
            ...(key !== 'page' && { page: 1 })
        }))
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            handleFilterChange('page', newPage)
        }
    }

    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 10,
            sortBy: "created_at",
            sortOrder: "desc",
            search: "",
            type: "",
            dateFrom: "",
            dateTo: ""
        })
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status) => {
        const statusColors = {
            'success': 'bg-green-100 text-green-800 border-green-200',
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'failed': 'bg-red-100 text-red-800 border-red-200',
            'cancelled': 'bg-gray-100 text-gray-800 border-gray-200'
        }
        
        return statusColors[status?.toLowerCase()] || statusColors['pending']
    }

    const paymentTypes = [
        { value: "", label: "All Types" },
        { value: "tuition", label: "Tuition Fee" },
        { value: "accommodation", label: "Accommodation" },
        { value: "registration", label: "Registration" },
        { value: "library", label: "Library Fee" },
        { value: "medical", label: "Medical Fee" },
        { value: "sports", label: "Sports Fee" },
        { value: "other", label: "Other" }
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Payment History</h1>
                    <p className="text-gray-600 mt-1">
                        {pagination.totalRecords} total payment{pagination.totalRecords !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={fetchPayments}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Student
                        </label>
                        <input
                            type="text"
                            placeholder="Student ID, name, email..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Payment Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Type
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {paymentTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort By
                        </label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="created_at">Date</option>
                            <option value="amount">Amount</option>
                            <option value="student_name">Student Name</option>
                            <option value="type">Payment Type</option>
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order
                        </label>
                        <select
                            value={filters.sortOrder}
                            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="text-gray-600">Loading payments...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center">
                                        <div className="text-gray-500">
                                            <p className="text-lg font-medium">No payments found</p>
                                            <p className="text-sm">Try adjusting your filters or search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment, index) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            #{payment.id || (pagination.page - 1) * filters.limit + index + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">
                                                    {payment.student_name || 'N/A'}
                                                </p>
                                                <p className="text-gray-500">
                                                    {payment.student_id || payment.matric_no}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                {payment.type?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(payment.status)} capitalize`}>
                                                {payment.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {formatDate(payment.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                    View
                                                </button>
                                                <button className="text-gray-600 hover:text-gray-800 font-medium">
                                                    Receipt
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 rounded-lg shadow-sm border">
                    <div className="flex items-center text-sm text-gray-700">
                        <span>
                            Showing {((pagination.page - 1) * filters.limit) + 1} to {' '}
                            {Math.min(pagination.page * filters.limit, pagination.totalRecords)} of {' '}
                            {pagination.totalRecords} results
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            disabled={!pagination.hasPrev}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex space-x-1">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                const pageNum = Math.max(1, pagination.page - 2) + i
                                if (pageNum > pagination.totalPages) return null
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                                            pageNum === pagination.page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>
                        
                        <button
                            disabled={!pagination.hasNext}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Items per page */}
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <label>Items per page:</label>
                    <select
                        value={filters.limit}
                        onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
        </div>
    )
}