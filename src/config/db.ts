import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI!,{
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        console.log("MongoDB connected successfully")
    }catch(error){
        console.log("MongoDB connection error:", error)
        process.exit(1);
    }
}

export default connectDB;