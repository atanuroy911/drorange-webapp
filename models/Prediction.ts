import { Schema, model, models } from "mongoose";

const PredictionSchema = new Schema({
  link: {
    type: Map,
    of: Number,
    required: true,
  },
  treeId: {
    type: String,
    required: true,
  },
  lastImage: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Avoid recompiling model during hot reloads
const Prediction = models.Prediction || model("Prediction", PredictionSchema);

export default Prediction;
