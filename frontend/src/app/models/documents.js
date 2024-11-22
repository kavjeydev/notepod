import mongoose from "mongoose";
import { type } from "os";

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: String, required: true },
  isArchived: { type: Boolean, required: true },
  parentDocument: String,
  content: String,
  coverimage: String,
  icon: String,
  published: { type: Boolean, required: true },
  isFolder: { type: Boolean, required: true },
  isActive: { type: Boolean, required: true },
  userProfile: String,
  publishedUserName: String,
  likes: Number,
  views: Number,
  words: Number,
  characters: Number,
  githubRepo: String,
});

const Document =
  mongoose.models.Document || mongoose.model("Document", DocumentSchema);
export default Document;
