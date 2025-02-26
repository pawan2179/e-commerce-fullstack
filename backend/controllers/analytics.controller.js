import Order from "../models/orders.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js"

export const getAnalyticsData = async(req, res) => {
  try {
    const analysisData = await analyticsData();
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() -  7*24*60*60*1000);

    const dailySalesData = await getDailySalesData(startDate, endDate);
    res.json({
      analysisData,
      dailySalesData
    });
  } catch (error) {
    console.log('Error in getting analysis data : ', error.message);
    res.status(500).json({message: "Somerthing wentwonf"})
  }
}

const getDailySalesData = async(startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
          sales: { $sum: 1},
          revenue: { $sum: "$totalAmount"}
        },
      },
      { $sort: { _id: 1}}
    ]);
  
    const dateArray = getDateInRange(startDate, endDate);
  
    return dateArray.map(date => {
      const foundData = dailySalesData.find(item => item._id === date);
  
      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0
      }
    })
  } catch (error) {
    console.log("error in generating daily sales data : ", error.message);
    res.status(500).json({message: "Something went wrong"});
  }
}

const getDateInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  while(currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
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