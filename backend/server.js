import express from "express"
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentsRoutes from "./routes/payments.rotue.js"
import analyticsRoutes from "./routes/analytics.routes.js"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import path from 'path';

dotenv.config();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

const app = express();

app.use(express.json({limit:"10mb"}));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("Healthcheck");
})

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
  connectDB();
});