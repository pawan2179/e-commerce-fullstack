import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js"

export const getAllProducts = async(req, res) => {
  try {
    const products = await Product.find({});
    res.json({products});
  } catch(error) {
    console.log("Error in getting all products : ", error.message);
    res.status(500).json({message: "Server error : ",error: error.message});
  }
}

export const getFeaturedProducts = async(req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if(featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Product.find({isFeatured: true}).lean();

    if(!featuredProducts) {
      return res.status(404).json({message: "No featured products"});
    }

    console.log("Featured: ", featuredProducts);

    await redis.set("featured_products", JSON.stringify(featuredProducts));
    return res.json(featuredProducts || []).status(200);
  } catch (error) {
    console.log("failed to get featured products");
    res.status(500).json({message: "Server error while fetching products"});
  }
}

export const createProduct = async(req, res) => {
  try {
    console.log("In create product");
    const {name, description, price, image, category} = req.body;
    let cloudinaryResponse = null;
    console.log(req.body);
    if(image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {folder:"products"})
    }

    console.log(cloudinaryResponse);

    const product = await Product.create({
      name,
      description,
      price,
      image:cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
      category
    });

    console.log(product);
    
    return res.status(201).json(product);
  } catch(error) {
    console.log("Failed to create product : ", error.message);
    return res.status(500).json({message: "Something went wrong"});
  }
}

export const deleteProduct = async(req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if(!product) {
      return res.status(404).json({message: "Product not found"});
    }

    if(product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Deleted image from cloudinary");
        await Product.findByIdAndDelete(req.params.id);
        res.json({message: "Product deleted successfully"}).status(200);
      } catch (error) {
        console.log("Error deleting image");
        return res.status(403).json({message: "Failed to delete image"})
      }
    }
  } catch(error) {

  }
}

export const getRecommendedProducts = async(req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: {size:3}
      },
      {
        $project:{
          _id:1,
          name:1,
          description:1,
          image:1,
          price:1
        }
      }
    ]);
    return res.status(200).json(products);
  } catch (error) {
    console.log("Error in get recommendation controller ", error.message);
    res.status(500).json({message: "Something went wrong"});
  }
}

export const getProductByCategory = async(req, res) => {
  try {
    const {category} = req.params;
    const products = await Product.find({category});
    res.json({products}).status(200);
  } catch (error) {
    console.log("Something went wrong in getProductByCategory controller: ", error.message);
    res.status(500).json({message: "Something went wrong"});
  }
}

export const toggleFeaturedProduct = async(req, res) => {
  try {
    console.log("in toggle backend");
    let product = await Product.findById(req.params.id).exec();
    console.log(product);
    if(product) {
      product.isFeatured = !product.isFeatured;
      await product.save();
      await updateFeaturedProductCache();
      res.json(product);
    }
  } catch (error) {
    console.log("Error in toggle feature controller: ", error.message);
    res.status(500).json({message: error.message});
  }
}

export const updateFeaturedProductCache = async() => {
  try {
    const featuredProdcuts = await Product.find({isFeatured: true}).lean();
    await redis.set("featured_products", JSON.stringify(featuredProdcuts));
  } catch (error) {
    console.log("error in updating featured products in cache");
    res.status(500).json({message: "Failed to update cache"});
  }
}