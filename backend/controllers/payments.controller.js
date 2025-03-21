import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupons.model.js";
import Order from "../models/orders.model.js";

export const createCheckoutSession = async(req, res) => {
  try {
    const {products, couponCode} = req.body;

    if(!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({error: "Invalid or empty produts array"});
    }

    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); //conversion to paise
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency:"inr",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount:amount
        },
        quantity: product.quantity || 1
      }
    });
    // console.log("Starting to Create coupon", couponCode);
    let coupon = null;
    if(couponCode) {
      coupon = await Coupon.findOne({code:couponCode,userId:req.user._id,isActive:true});
      if(coupon) {
        totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
      }
    }
    // console.log("coupon created", coupon);

    const session = await stripe.checkout.sessions.create({
      payment_method_types:["card"],
      line_items:lineItems,
      mode:"payment",
      success_url:`${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
          { coupon: await createStripeCoupon(coupon.discountPercent) }
        ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((product) => ({
            id: product._id,
            quantity: product.quantity,
            price: product.price
          }))
        )
      }
    });

    // console.log("Session created : ", session);

    if(totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }
    // console.log("new coupon created and saved");
    res.status(200).json({id: session.id, totalAmount: totalAmount/100});
  } catch (error) {
    console.log("Something went wrong in creating session : ", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
}

const createStripeCoupon = async(discount) => {
  const coupon = await stripe.coupons.create({
    percent_off: discount,
    duration:"once"
  });
  return coupon.id;
}

const createNewCoupon = async(userId) => {
  await Coupon.findOneAndDelete({userId: userId});
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercent:10,
    expirationDate: new Date(Date.now() + 30*24*60*60*1000),
    userId: userId
  })

  await newCoupon.save();

  return newCoupon;
}

export const checkoutSession = async(req, res) => {
  try {
    const {sessionId} = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if(session.payment_status === "paid") {
      if(session.metadata.couponCode) {
        await Coupon.findOneAndUpdate({
          code: session.metadata.couponCode, userId: session.metadata.userId
        }, { isActive: false})
      }
    }

    //create order
    const products = JSON.parse(session.metadata.products);
    const newOrder = new Order({
      user: session.metadata.userId,
      products: products.map(product => ({
        product: product.id,
        price: product.price,
        quantity: product.quantity
      })),
      totalAmount: session.amount_total / 100, //convert to dollar s
      stripeSessionId: sessionId
    });

    await newOrder.save();
    res.status(200).json({
      success: true,
      message: "Payment successful, order created",
      orderId: newOrder._id
    })
  } catch (error) {
    console.log("Something went wrong when creating order : ", error.message);
    res.status(500).json({message: "Something went wrong"});
  }
}