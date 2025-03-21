import { create } from "zustand";
import axios from "../lib/axios";
import {toast} from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart:[],
  coupon:null,
  isCouponApplied: false,
  total: 0,
  subTotal: 0,
  getCartItems: async() => {
    try {
      const res = await axios.get('/cart');
      console.log(res);
      set({cart: res.data})
      get().calculateTotals();
    } catch (error) {
      set({cart: []});
      toast.error(error.response.data.message || "Error occured while getting cart");
    }
  },

  addToCart: async(product) => {
    try {
      const res = await axios.post('/cart', {productId: product._id});
      toast.success("Product added successfully");

      set((prevState) => {
        const existingItem = prevState.cart.find((item) => item._id === product._id);
        const newCart = existingItem ?
          prevState.cart.map((item) => item._id === product._id ? {...item, quantity: item.quantity + 1} : item) :
          [...prevState.cart, {...product, quantity: 1}];
        return {cart: newCart};
      });
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message || "Failed to add item to cart");
    }
  },
  calculateTotals: () => {
    const {cart, coupon} = get();
    const subTotal = cart.reduce((sum, item) => (sum + item.price) * item.quantity, 0);
    let total = subTotal;

    if(coupon) {
      const discount = subTotal * (coupon.discountPercent /100);
      total = subTotal - discount;
    }
    // console.log("calculate total : ", subTotal, total);
    set({subTotal, total});
  },
  removeFromCart: async(id) => {
    try {
      await axios.delete(`/cart`, {data: {productId: id}});
      set((prevState) => ({ cart: prevState.cart.filter(item => item._id !== id)}));
      get().calculateTotals();
    } catch (error) {
      
    }
  },
  updateQuantity: async(id, quantity) => {
    try {
      if(quantity === 0) {
        get().removeFromCart(id);
        return;
      }
  
      await axios.put(`/cart/${id}`, {quantity});
      set((prevState) => ({
        cart: prevState.cart.map((item) => item._id === id ? {...item, quantity: quantity} : item)
      }));
      get().calculateTotals();
    } catch (error) {
      
    }
  },
  clearCart: async() => {
    try {
      set({cart:[], coupon:null, total:0, subTotal:0, isCouponApplied: false})
    } catch (error) {
      
    }
  },
  getMyCoupon: async() => {
    try {
      const res = await axios.get('/coupons');
      set({coupon: res.data});
      // console.log("Coupon fetched: ", res.data);
    } catch (error) {
      // console.log(error);
      console.log("Error in fetching coupon");
    }
  },
  applyCoupon: async(code) => {
    try {
      const res = await axios.post('/coupons/validate', {code});
      set({coupon: response.data, isCouponApplied: true});
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error("Cannot apply this coupon");
    }
  },
  removeCoupon: () => {
    steps({coupon:null, isCouponApplied: false});
    get().calculateTotals();
    toast.success("Coupon removed");
  }
}))