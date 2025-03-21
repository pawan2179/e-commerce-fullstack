import { ArrowLeft, CrossIcon, XCircle } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const PurchaseCancel = () => {
  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
        <div className='p-6 sm:p-8'>
          <div className='flex justify-center'>
            <XCircle className='text-red-400 w-16 h-16 mb-4' />
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold text-center text-red-400 mb-2'>
            Purchase Cancelled!
          </h1>
          <p className='text-gray-300 text-center mb-2'>
            Your order has been cancelled. No charge has been made.
          </p>
          <div className='bg-gray-700 rounded-lg p-4 mb-6'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-gray-400'>If you encountered any issues, Please contact our support team.</span>
            </div>
          </div>

          <div className='space-y-6'>
            <Link
              to={'/'}
              className='w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center'>
              <ArrowLeft className='ml-2' size={18}/>
              {" "}Return to Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseCancel