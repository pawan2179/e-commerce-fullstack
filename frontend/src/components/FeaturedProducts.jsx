import { ShoppingCart } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import {useCartStore} from '../stores/useCartStore'
import ProductCard from '../components/ProductCard'

const FeaturedProducts = ({featuredProducts}) => {
  const [currentIndex,setCurrentIndex] = useState(0);
  const [itemsPerPage,setItemsPerPage] = useState(4);
  const {addToCart} =  useCartStore();

  useEffect(() => {
    const handleResize = () => {
      if(window.innerWidth < 640) setItemsPerPage(1);
      else if(window.innerWidth < 1024) setItemsPerPage(2);
      else if(window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  },[]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
  }
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
  }
  const isStartDisabled = currentIndex == 0;
  const isEndDisabled = currentIndex >= featuredProducts
  return (
    <div className='py-12'>
      <div className='container mx-auto px-4'>
        <h2 className='text-center text-5xl xm:text-6xl font-bold text-emerald-400 mb-4'>Featured Products</h2>
        <div className='relative'>
          <div className='overflow-hidden'>
            <div className='flex transition-transform duration-300 ease-in-out w-full items-center justify-center'
              style={{transform: `translateX(-${currentIndex*(100/itemsPerPage)}%)`}}
            >
              <div>
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedProducts