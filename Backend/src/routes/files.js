const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { 
  getMedicalFiles, 
  uploadMedicalFile, 
  downloadMedicalFile, 
  deleteMedicalFile,
  listMedicalFilesForDoctor 
} = require('../controllers/fileController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// GET /api/files/medical
router.get('/medical', authenticateToken, getMedicalFiles);

// POST /api/files/medical/upload
router.post('/medical/upload', authenticateToken, upload.single('file'), uploadMedicalFile);

// GET /api/files/medical/:fileId/download
router.get('/medical/:fileId/download', authenticateToken, downloadMedicalFile);

// DELETE /api/files/medical/:fileId
router.delete('/medical/:fileId', authenticateToken, deleteMedicalFile);

// GET /api/files/medical/patient/:patientId (for doctors)
router.get('/medical/patient/:patientId', authenticateToken, listMedicalFilesForDoctor);

module.exports = router;
