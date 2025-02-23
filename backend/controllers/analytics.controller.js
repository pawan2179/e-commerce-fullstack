import Order from "../models/orders.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js"

export const getAnalyticsData = async(req, res) => {
  try {
    const analysisData = await analyticsData();
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() -  7*24*60*60);
  } catch (error) {
    
  }
}

export const analyticsData = async() => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group:{
        _id: null, //groups all documents together
        totalSales: {$sum:1},
        totalRevenue: {$sum:"$totalAmount"}
      }
    }
  ])

  const {totalSales, totalRevenue} = salesData[0] || { totalSales: 0, totalRevenue: 0 };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue
  }
}