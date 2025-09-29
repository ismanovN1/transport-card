const mongoose = require("mongoose");

const StationsRenamedSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  newTitle: { type: String, required: true },
});

module.exports = mongoose.model("StationsRenamed", StationsRenamedSchema);
