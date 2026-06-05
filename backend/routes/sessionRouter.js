import express from "express";
import { createSession, getMySessions, upload } from "../controllers/sessionController.js";

const sessionRouter = express.Router();

sessionRouter.post("/", upload.single("cv"), createSession);   // ← Important: multer middleware
sessionRouter.get("/my", getMySessions);

export default sessionRouter;