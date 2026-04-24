const express = require('express');
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/csv/' });

router.use(auth); // Protect all routes

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.post('/import', upload.single('file'), transactionController.importCSV);

module.exports = router;
