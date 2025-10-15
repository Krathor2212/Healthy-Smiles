const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { uploadMedicalFile, listMedicalFilesForDoctor } = require('../controllers/fileController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/files/medical/upload
router.post('/medical/upload', auth(true), upload.single('file'), uploadMedicalFile);

// GET /api/files/medical/patient/:patientId
router.get('/medical/patient/:patientId', auth(true), listMedicalFilesForDoctor);

module.exports = router;
