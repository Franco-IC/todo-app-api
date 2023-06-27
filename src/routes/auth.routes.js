import { Router } from "express";
import * as AuthController from "../controllers/auth.controller.js";

const router = Router();

// register
router.post("/signup", AuthController.signUp);

// login
router.post("/signin", AuthController.signIn);

// edit user by ID
router.put("/users/update/:id", AuthController.updateUserByID);

// delete user by ID
router.delete("/users/delete/:id", AuthController.deleteUserByID);

export default router;
