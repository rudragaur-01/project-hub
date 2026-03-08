import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  { author: String, text: String, date: String },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  { action: String, date: String },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    dueDate: { type: String, default: "" },

    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    comments: { type: [commentSchema], default: [] },
    activity: { type: [activitySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);