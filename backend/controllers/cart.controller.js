import Product from "../models/product.model";

export const addToCard = async(req, res) => {
  try {
    const {productId} = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find(item => item.id === productId);
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
    const user = req.user;

    if(!productId) {
      user.cartItems = [];
    }else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
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
    const {quantity} = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);

    if(existingItem) {
      if(quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
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
    const products = await Product.find({_id:{$in:req.user.cartItems}});

    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find((item) => item.id === product.id);
      return {...product.toJSON(), quantity: item.quantity}
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts : ", error.message);
    res.status(500).json({message: "Something went wrong"});
  }
}