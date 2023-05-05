import mongoose from "mongoose";

const connectDB = async() => {
try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGO_URL)

    console.log(`Connected to: ${conn.connection.host}`.cyan.underline);
} catch (error) {
    console.log(`Error: ${error.message}`)
    process.exit();
}
}

export default connectDB;