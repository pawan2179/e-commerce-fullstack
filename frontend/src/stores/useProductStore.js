import { create } from "zustand";
import toast from "react-hot-toast";
import axios from '../lib/axios';

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  recommendedProducts: [],

  setProducts: (products) => set({products}),
  createProduct: async (productData) => {
    set({loading: true})
    try {
      const res = await axios.post('/products', productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false
      }));
    } catch (error) {
      set({loading: false});
      toast(error.response.data.message || "An error occured");
    }
  },
  deleteProduct: async(id) => {},
  fetchAllProducts: async() => {
    set({loading: true});
    try {
      const res = await axios.get('/products');
      set({products: res.data.products, loading: false});
    } catch (error) {
      set({error: "Failed to fetch products", loading: false});
      toast.error(error.response.data.error || "An error occured");
    }
  },
  toggleFeaturedProduct: async(id) => {
    console.log("in toggle featured");
    set({loading:true});
    try {
      const resp = await axios.patch(`/products/${id}`);
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === id ? {...product, isFeatured: resp.data.isFeatured} : product),
        loading: false
      }))
    } catch (error) {
      set({loading: false});
      toast.error(error.response.data.message || "An error occured");
    }
  },
  fetchProductsByCategory: async(category) => {
    set({loading: true});
    try {
      const res = await axios.get(`/products/category/${category}`);
      set({
        products: res.data.products,
        loading:false}
      )
    } catch (error) {
      
    }
  },
  getRecommendedProducts: async() => {
    set({loading: true});
    try {
      // console.log("In get recommended products");
      const res = await axios.get('/products/recommendations');
      // console.log("response -> ", res);
      set({recommendedProducts: res.data, loading: false});
      // console.log("recommendedproducts =>",get().recommendedProducts);
    } catch (error) {
      set({loading: false, recommendedProducts: []});
      // console.log(error);
      toast.error("An error occured in fetching recommendations");
    }
  },
  fetchFeaturedProducts: async() => {
    set({loading:true});
    try {
      const res = await axios.get('/products/featured');
      console.log("Featured : ", res);
      set({products: res.data, loading: false});
    } catch (error) {
      set({error: "Failed to fetch featured products.", loading: false});
      console.log("Failed to fetch featured products");
    }
  }
}))