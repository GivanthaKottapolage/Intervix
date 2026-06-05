import Session from "../models/Session.js";
import multer from "multer";
import path from "path";

// Multer Setup - Store CVs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/cvs/");   // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"), false);
        }
    }
});

export { upload };   // Export upload middleware

export function createSession(req, res) {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Please login first" });
    }

    const session = new Session({
        userEmail: user.email,
        fullName: req.body.fullName || user.fullName,
        cvFilePath: req.file.path,     // ← This comes from multer
    });

    session.save()
        .then(() => {
            res.json({
                message: "CV uploaded and session created successfully",
                sessionId: session._id,
                cvFilePath: req.file.path
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Error creating session",
                error: error.message
            });
        });
}

export function getMySessions(req, res) {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Please login" });
    }

    Session.find({ userEmail: user.email })
        .sort({ createdAt: -1 })
        .then((sessions) => res.json(sessions))
        .catch((error) => {
            res.status(500).json({ message: "Error fetching sessions", error: error.message });
        });
}