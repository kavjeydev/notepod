import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected");
  } catch (error) {
    throw new Error(error);
  }
};

export default connectMongoDB;
