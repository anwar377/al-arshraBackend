const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/otp");
const { generateOtp } = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");


// ✅ Register Controller
exports.register = async (req, res) => {
    try {
        const { name, email, mobile, password, role } = req.body;

        // 🔹 Check if email or mobile already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email
                    ? "Email already exists"
                    : "Mobile number already exists",
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        // 🔹 Create user (password will be hashed by pre-save hook)
        const user = await User.create({
            name,
            email,
            mobile,
            password: hashPassword,
            role: role || "user",
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Register error:", err);
        // Handle duplicate key errors
        if (err.code === 11000) {
            return res.status(400).json({ message: "Duplicate field value detected" });
        }
        res.status(500).json({ message: "Register error", error: err.message });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.isBanned) return res.status(404).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: "Login error", error: err.message });
    }
};


// Send OTP
exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (!existing) return res.status(404).json({ message: "User not found" });

        // Prevent spamming
        const lastOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
        if (lastOtp && Date.now() - lastOtp.createdAt < 60 * 1000) {
            return res.status(429).json({ message: "Please wait 1 minute before requesting another OTP" });
        }

        const otp = generateOtp();
        await Otp.deleteMany({ email });
        await Otp.create({ email, otp });

        const html = `<h3>OTP for Password Reset</h3>
                  <p>Your OTP is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`;
        await sendEmail(email, "Your OTP for Password Reset", html);

        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ message: "OTP send failed", error: err.message });
    }
};

// Verify OTP and reset password
exports.verifyOtpAndResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    console.log(req.body)
    try {
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ message: "Invalid or expired OTP" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ email }, { password: hashed });
        await Otp.deleteMany({ email });

        res.json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: "Password reset failed", error: err.message });
    }
};


// ✅ Get current logged-in user using token
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch user", error: err.message });
    }
};
