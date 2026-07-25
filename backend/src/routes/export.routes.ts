import { Router } from 'express';
import { exportExcel, exportCSV, exportPDF } from '../controllers/export.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/excel', exportExcel);
router.get('/csv', exportCSV);
router.get('/pdf', exportPDF);

export default router;
