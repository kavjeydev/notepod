import mongoose from "mongoose";
import { type } from "os";

const LikeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  documentId: { type: String, required: true },
});

const Likes = mongoose.models.Likes || mongoose.model("Likes", LikeSchema);
export default Likes;
