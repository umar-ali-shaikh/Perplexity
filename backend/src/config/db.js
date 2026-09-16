import mongoose from "mongoose";
import dns from "dns";

// Windows par DNS-over-HTTPS enabled hone par Node ka default resolver
// (127.0.0.1 loopback stub) SRV lookup par ECONNREFUSED deta hai.
// Isliye plain DNS server explicitly set kar rahe hain.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;