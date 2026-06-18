const express = require('express');
const { createSession, getMySessions, upload } = require('../controllers/sessionController');

const sessionRouter = express.Router();

sessionRouter.post('/', upload.single('cv'), createSession);
sessionRouter.get('/my', getMySessions);

module.exports = sessionRouter;