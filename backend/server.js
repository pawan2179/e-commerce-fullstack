import express from "express"
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const PORT = process.env.PORT || 5001;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/", (req, res) => {
  res.send("Healthcheck");
})

app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
  connectDB();
});