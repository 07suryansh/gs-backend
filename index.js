import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const dbUrl = process.env.MONGODB_URL;
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  taskType: String,
  customTimestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", taskSchema);

app.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({});
    console.log("tasks-> " + tasks);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/", async (req, res) => {
  const { title, description, taskType } = req.body.body;
  console.log(req.body);
  if (!title) {
    return res.status(400).json({ error: "Fill all required fields" });
  }
  try {
    const newTask = new Task({ title, description, taskType });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/start", async (req, res) => {
  const { id, title, description, taskType } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, taskType: "progress" },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).send("Task not found");
    }
    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json("Internal server error");
  }
});
app.post("/completed", async (req, res) => {
  const { id, title, description, taskType } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, taskType: "completed" ,customTimestamp:Date.now()},
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json("Task not found");
    }
    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json("Internal server error");
  }
});
