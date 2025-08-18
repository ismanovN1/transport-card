const mongoose = require("mongoose");

const stationsBlackListSchema = new mongoose.Schema({
    title: { type: String },
    okato: { type: String},
    id: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model("StationsBlackList", stationsBlackListSchema);
