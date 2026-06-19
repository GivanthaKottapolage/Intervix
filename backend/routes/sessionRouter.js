const express = require('express');
const {
    createSession,
    getMySessions,
    getSessionById,
    upload
} = require('../controllers/sessionController');

const sessionRouter = express.Router();

sessionRouter.post('/', upload.single('cv'), createSession);
sessionRouter.get('/my', getMySessions);
sessionRouter.get('/:id', getSessionById);

module.exports = sessionRouter;
