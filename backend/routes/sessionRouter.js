const express = require('express');
const {
    createSession,
    getAllSessions,
    getMySessions,
    getSessionById,
    getSessionReport,
    upload
} = require('../controllers/sessionController');
const { isAdminMiddleware } = require('../middleware/isAdmin');

const sessionRouter = express.Router();

sessionRouter.post('/', upload.single('cv'), createSession);
sessionRouter.get('/my', getMySessions);
sessionRouter.get('/admin/all', isAdminMiddleware, getAllSessions);
sessionRouter.get('/:id/report', getSessionReport);
sessionRouter.get('/:id', getSessionById);

module.exports = sessionRouter;
