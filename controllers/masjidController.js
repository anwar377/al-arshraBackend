const Masjid = require("../models/Masjid");
const User = require("../models/User");

/**
 * @desc    Register a new Masjid (any logged-in user)
 * @route   POST /api/masjids
 * @access  Private
 */
exports.registerMasjid = async (req, res) => {
    console.log("Register Masjid Request Body:", req.body);
    try {
        if (!req.user || !req.user._id) {
            return res
                .status(401)
                .json({ success: false, message: "User not authenticated" });
        }

        const {
            masjidName,
            villageName,
            subDistName,
            distName,
            stateName,
            countryName,
            foundationYear,
            founderName,
            madarsa,
        } = req.body;

        if (
            !masjidName ||
            !villageName ||
            !subDistName ||
            !distName ||
            !stateName ||
            !countryName ||
            !foundationYear
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided",
            });
        }

        // ✅ Rule 1: User cannot register more than one masjid
        const user = await User.findById(req.user._id);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Logged-in user not found" });
        }

        if (user.masjid) {
            const existingUserMasjid = await Masjid.findById(user.masjid);
            if (existingUserMasjid) {
                return res.status(400).json({
                    success: false,
                    message: "You have already registered a masjid",
                });
            } else {
                // 🧹 Cleanup stale reference if masjid was deleted
                user.masjid = null;
                await user.save();
            }
        }

        // ✅ Rule 2: Masjid must be unique by (name + full address)
        const existingMasjid = await Masjid.findOne({
            masjidName: { $regex: new RegExp(`^${masjidName.trim()}$`, "i") },
            villageName: { $regex: new RegExp(`^${villageName.trim()}$`, "i") },
            subDistName: { $regex: new RegExp(`^${subDistName.trim()}$`, "i") },
            distName: { $regex: new RegExp(`^${distName.trim()}$`, "i") },
            stateName: { $regex: new RegExp(`^${stateName.trim()}$`, "i") },
            countryName: { $regex: new RegExp(`^${countryName.trim()}$`, "i") },
        });

        if (existingMasjid) {
            return res.status(409).json({
                success: false,
                message: "A masjid with this name already exists at this address",
            });
        }

        // ✅ Create new masjid
        const masjid = await Masjid.create({
            masjidName: masjidName.trim(),
            villageName: villageName.trim(),
            subDistName: subDistName.trim(),
            distName: distName.trim(),
            stateName: stateName.trim(),
            countryName: countryName.trim(),
            foundationYear,
            founderName: founderName?.trim() || "",
            madarsa: madarsa || false,
            createdBy: req.user._id,
        });

        // ✅ Link masjid to user
        user.masjid = masjid._id;
        await user.save();

        res.status(201).json({
            success: true,
            message: "Masjid registered successfully",
            data: masjid,
        });
    } catch (error) {
        console.error("Masjid Registration Error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
        });
    }
};




/**
 * @desc    Update masjid (only creator)
 * @route   PUT /api/masjids/:id
 * @access  Private
 */
exports.updateMasjid = async (req, res) => {
    try {
        const { id } = req.params;
        const masjid = await Masjid.findById(id);
        if (!masjid) return res.status(404).json({ success: false, message: "Masjid not found" });

        if (masjid.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const updatedMasjid = await Masjid.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ success: true, message: "Masjid updated successfully", data: updatedMasjid });
    } catch (error) {
        console.error("Update Masjid Error:", error);
        res.status(500).json({ success: false, message: "Update failed" });
    }
};

/**
 * @desc    Delete masjid (only creator)
 * @route   DELETE /api/masjids/:id
 * @access  Private
 */
exports.deleteMasjid = async (req, res) => {
    try {
        const { id } = req.params;
        const masjid = await Masjid.findById(id);
        if (!masjid) return res.status(404).json({ success: false, message: "Masjid not found" });

        if (masjid.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await Masjid.findByIdAndDelete(id);

        // Remove masjid from user if linked
        const user = await User.findById(req.user._id);
        if (user && user.masjid?.toString() === id) {
            user.masjid = null;
            await user.save();
        }

        res.status(200).json({ success: true, message: "Masjid deleted successfully" });
    } catch (error) {
        console.error("Delete Masjid Error:", error);
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

/**
 * @desc    Get all masjids
 * @route   GET /api/masjids
 * @access  Public
 */
exports.getAllMasjids = async (req, res) => {
    try {
        const masjids = await Masjid.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: masjids.length, data: masjids });
    } catch (error) {
        console.error("Get All Masjids Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch masjids" });
    }
};

/**
 * @desc    Get single masjid by ID
 * @route   GET /api/masjids/:id
 * @access  Public
 */
exports.getMasjidById = async (req, res) => {
    try {
        const { id } = req.params;
        const masjid = await Masjid.findById(id);
        if (!masjid) return res.status(404).json({ success: false, message: "Masjid not found" });

        res.status(200).json({ success: true, data: masjid });
    } catch (error) {
        console.error("Get Masjid By ID Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch masjid" });
    }
};

/**
 * @desc    Get logged-in user's masjid
 * @route   GET /api/masjids/my
 * @access  Private
 */
// ✅ Get current user's masjid
exports.getMyMasjid = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const user = await User.findById(req.user._id).populate("masjid");
        if (!user || !user.masjid) {
            return res.status(404).json({ success: false, message: "No masjid assigned" });
        }

        res.status(200).json({ success: true, data: user.masjid });
    } catch (error) {
        console.error("Get My Masjid Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch user's masjid" });
    }
};

