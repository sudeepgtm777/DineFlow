import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model";

const seedAdmin = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;

    const existing = await User.findOne({ email });
    if (existing) return;

    await User.create({
        fullname: process.env.ADMIN_FULLNAME || "Admin",
        email,
        phoneNumber: process.env.ADMIN_PHONE || "9800000000",
        password: await bcrypt.hash(password, 10),
        role: "admin",
        profile: { profilePhoto: "" },
    });
    console.log(`Seeded admin user ${email}`);
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongodb connected successfully');
        await seedAdmin();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
export default connectDB;