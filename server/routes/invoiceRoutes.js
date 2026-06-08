const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/invoices/' });

router.use(auth);

router.post('/upload', aiLimiter, upload.single('invoice'), invoiceController.uploadAndProcess);
router.get('/', invoiceController.getInvoices);
router.delete('/:id', invoiceController.deleteInvoice);
router.patch('/:id', invoiceController.updateInvoice);

module.exports = router;
