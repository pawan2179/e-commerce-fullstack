import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);
    console.info(`Connected to mongoDB : ${connection.connection.host}`)
  } catch(error) {
    console.error("Failed to connect to DB : ", error);
    process.exit(1);
  }
}