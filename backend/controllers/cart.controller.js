import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const addToCard = async(req, res) => {
  try {
    const {productId} = req.body;
    const user = await User.findOne({_id: req.user._id});
    console.log("in add cart -- > user : ", user);
    const existingItem = user.cartItems.find(item => item._id === productId);
    if(existingItem) {
      existingItem.quantity += 1;
    }
    else {
      user.cartItems.push(productId);
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("something went wrong in addToCart : ", error.message);
    res.status(500).json({message: "Something went wrong"})
  }
}

export const removeAllFromCart = async(req, res) => {
  try {
    const {productId} = req.body;
    const user = await User.findOne({_id: req.user._id}).exec();

    console.log("remove from cart --> ", user);
    if(!productId) {
      user.cartItems = [];
    }else {
      user.cartItems = user.cartItems.filter((item) => item._id != productId);
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Something went wrong in remove from cart: ", error.message);
    res.status(500).json({message: "Something went wrong"});
  }
}

export const updateQuantity = async(req, res) => {
  try {
    const {id:productId} = req.params;
    console.log("Item to delete : ", productId);
    const {quantity} = req.body;
    const user = await User.findOne({_id: req.user._id}).exec();
    console.log(user);
    const existingItem = user.cartItems.find((item) => item._id == productId);

    if(existingItem) {
      if(quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item._id != productId);
        await user.save();
        res.json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(400).json({message: "Item not present in cart"});
    }
  } catch (error) {
    console.log("error in update quantity : ", error.message);
    res.status(500).json({message: "Something went wrong"});
  }
}

export const getCartProducts = async(req, res) => {
  try {
    const user = await User.findOne({_id: req.user._id});
    console.log(user);
    const products = await Product.find({_id:{$in:user.cartItems}});

    const cartItems = products.map((product) => {
      const item = user.cartItems.find((item) => item.id === product.id);
      return {...product.toJSON(), quantity: item.quantity}
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts : ", error.message);
    res.status(500).json({message: "Something went wrong"});
  }
}