const mongoose = require("mongoose");

const masjidSchema = new mongoose.Schema(
    {
        masjidName: { type: String, required: true, trim: true },
        villageName: { type: String, required: true, trim: true },
        subDisName: { type: String, required: true, trim: true },
        distName: { type: String, required: true, trim: true },
        stateName: { type: String, required: true, trim: true },
        countryName: { type: String, required: true, trim: true },
        foundationYear: { type: Number, required: true },
        founderName: { type: String, default: "" },
        madarsa: { type: Boolean },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Masjid", masjidSchema);
