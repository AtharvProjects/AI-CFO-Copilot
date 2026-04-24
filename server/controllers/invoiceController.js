const supabase = require('../supabaseClient');
const ocrService = require('../services/ocrService');

const invoiceController = {
  async uploadAndProcess(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ error: 'No invoice file uploaded' });

      const imagePath = req.file.path;
      
      // 1. Process OCR and AI parsing
      const { rawText, parsedData } = await ocrService.processInvoice(imagePath, req.file.originalname);

      // 2. Insert into invoices table
      const invoiceObj = {
        user_id: req.user.userId,
        file_url: imagePath,
        vendor: parsedData?.vendor || null,
        invoice_date: parsedData?.invoice_date || null,
        invoice_number: parsedData?.invoice_number || null,
        total: parsedData?.total ? parseFloat(parsedData.total) * 100 : null, // Store in paise
        gstin: parsedData?.gstin || null
      };

      const { data: insertedInvoice, error } = await supabase
        .from('invoices')
        .insert([invoiceObj])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ message: 'Invoice processed successfully', data: insertedInvoice });
    } catch (error) {
      next(error);
    }
  },

  async getInvoices(req, res, next) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', req.user.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = invoiceController;
