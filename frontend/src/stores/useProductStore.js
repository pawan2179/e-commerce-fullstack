import { create } from "zustand";
import toast from "react-hot-toast";
import axios from '../lib/axios';

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

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
  toggleFeaturedProduct: async({id}) => {
    console.log("in toggle featured");
    set({loading:true});
    try {
      const resp = await axios.patch(`/product/${id}`);
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === id ? {...product, isFeatured: resp.data.isFeatured} : product),
        loading: false
      }))
    } catch (error) {
      set({loading: false});
      toast.error(error.response.data.message || "An error occured");
    }
  }
}))