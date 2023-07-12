import { Router } from "express";
import * as TasksController from "../controllers/tasks.controller.js";

const router = Router();

// Index (all tasks)
router.get("/", TasksController.getAllTasks);

// Get Task by ID
router.get("/id/:taskID", TasksController.getTaskByID);

// Get Tasks by Author
router.get("/author/:author", TasksController.getTasksByAuthor);

// New Task
router.post("/new", TasksController.newTask);

// Task Update by ID
router.put("/update/:taskID", TasksController.updateTaskByID);

// Task Delete by ID
router.delete("/delete/:taskID", TasksController.deleteTaskByID);

export default router;
