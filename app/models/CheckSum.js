const mongoose = require("mongoose");

const checkSumSchema = new mongoose.Schema({
    tableName: { type: String, required: true },
    value: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("CheckSum", checkSumSchema);
