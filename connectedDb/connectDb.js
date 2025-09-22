const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        });
        console.log("Connection Successful!");
    } catch (error) {
        console.error("Connection Failed!", error);
    }
}
