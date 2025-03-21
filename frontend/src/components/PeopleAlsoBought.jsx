import React, { useEffect } from 'react'
import ProductCard from './ProductCard';
import { useCartStore } from '../stores/useCartStore';
import { useProductStore } from '../stores/useProductStore';

const PeopleAlsoBought = () => {
  const {recommendedProducts, getRecommendedProducts} = useProductStore();
  useEffect(() => {
    console.log("getting recommendedproduct")
    getRecommendedProducts();
  }, [getRecommendedProducts]);
  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-emerald-400'>People also bought</h3>
      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {recommendedProducts?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default PeopleAlsoBought