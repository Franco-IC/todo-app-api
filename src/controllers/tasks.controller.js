import { MySQLPool } from "../db.js";
import { updateAPIKeyUsage } from "../utils/APIKeysConfig.js";
import { errorJSON } from "../utils/loggers.js";
import taskValidations from "../utils/taskValidations.js";

export async function getAllTasks(req, res) {
  try {
    const [allTasks] = await MySQLPool.query(
      "SELECT id, author, title, description, status FROM tasks"
    );

    if (allTasks.length > 0) res.json(allTasks);
    else throw new Error("No tasks");
  } catch (error) {
    error.message === "No tasks"
      ? errorJSON(res, error.message, 404)
      : errorJSON(res, error.message);
  }
}

export async function getTaskByID(req, res) {
  try {
    const { taskID } = req.params;

    if (isNaN(Number(taskID))) {
      throw new Error("Task ID must be type Int");
    }

    const [task] = await MySQLPool.query(
      "SELECT id, author, title, description, status FROM tasks WHERE id = ?",
      [taskID]
    );

    if (task.length > 0) res.json(task[0]);
    else throw new Error("Task not found");
  } catch (error) {
    errorJSON(res, error.message, 404);
  }
}

export async function getTasksByAuthor(req, res) {
  try {
    const { author } = req.params;

    const [tasks] = await MySQLPool.query(
      "SELECT id, title, description, status FROM tasks WHERE author = ?",
      [author.trim()]
    );

    if (tasks.length > 0) res.json(tasks);
    else throw new Error("Author has no tasks created");
  } catch (error) {
    error.message === "Author has no tasks created"
      ? errorJSON(res, error.message, 404)
      : errorJSON(res, error.message);
  }
}

export async function newTask(req, res) {
  try {
    const { author, title, description, status } = req.body;
    const APIKey = req.headers["api_key"];

    if (!author || !title || !description || !status) {
      throw new Error("Empty fields are not allowed");
    }

    const [createdTask] = await MySQLPool.query("INSERT INTO tasks SET ?", [
      { author, title, description, status, key_used: APIKey },
    ]);

    req.privilege === "PUBLIC" ? await updateAPIKeyUsage(APIKey) : "";

    res.status(201).json({
      id: createdTask.insertId,
      author,
      title,
      description,
      status,
    });
  } catch (error) {
    errorJSON(res, error.message);
  }
}

export async function updateTaskByID(req, res) {
  try {
    const { author, title, description, status } = req.body;
    const { taskID } = req.params;
    const APIKey = req.headers["api_key"];

    if (!author || !title || !description || !status) {
      throw new Error("Empty fields are not allowed");
    }

    if (isNaN(Number(taskID))) {
      throw new Error("Task ID must be type Int");
    }

    const [currentTask] = await MySQLPool.query(
      "SELECT * FROM tasks WHERE id = ?",
      [taskID]
    );
    taskValidations(APIKey, req.privilege, currentTask);

    const [updatedTaskResult] = await MySQLPool.query(
      "UPDATE tasks SET ? WHERE id = ?",
      [{ author, title, description, status }, taskID]
    );

    req.privilege === "PUBLIC" ? await updateAPIKeyUsage(APIKey) : "";

    res.json({
      id: taskID,
      author,
      title,
      description,
      status,
    });
  } catch (error) {
    errorJSON(res, error.message);
  }
}

export async function deleteTaskByID(req, res) {
  try {
    const { taskID } = req.params;
    const APIKey = req.headers["api_key"];

    if (isNaN(Number(taskID))) {
      throw new Error("Task ID must be type Int");
    }

    const [currentTask] = await MySQLPool.query(
      "SELECT * FROM tasks WHERE id = ?",
      [taskID]
    );
    taskValidations(APIKey, req.privilege, currentTask);

    const [deletedTaskResult] = await MySQLPool.query(
      "DELETE FROM tasks WHERE id = ?",
      [taskID]
    );

    req.privilege === "PUBLIC" ? await updateAPIKeyUsage(APIKey) : "";

    res.json({ message: "Task succesfully deleted" });
  } catch (error) {
    errorJSON(res, error.message);
  }
}
