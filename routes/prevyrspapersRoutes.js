import express from 'express';
import * as prevspapersController from '../controllers/prevspapersController.js'
import multer from 'multer'

const router = express.Router()
const upload=multer({storage:multer.memoryStorage()})

router.post('/upload',upload.single('pdf'),prevspapersController.upload)
router.get('/getpapers',prevspapersController.getpapers)
router.get('/getpdf/:id',prevspapersController.getpdf)
router.delete('/pdfdelete/:id',prevspapersController.pdfdelete)

export default router;  