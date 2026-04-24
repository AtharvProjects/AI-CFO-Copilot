const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const groqService = require('./groqService');
const fs = require('fs');

const ocrService = {
  /**
   * Preprocess image using Sharp to improve OCR accuracy
   */
  async preprocessImage(imagePath) {
    const ext = path.extname(imagePath);
    const processedPath = imagePath.replace(ext, `_processed${ext}`);
    
    await sharp(imagePath)
      .greyscale()
      .normalize()
      .linear(1.5, -0.5) // Increase contrast
      .toFile(processedPath);
      
    return processedPath;
  },

  /**
   * Extract text and parse with AI
   */
  async processInvoice(imagePath) {
    let processedPath = null;
    try {
      processedPath = await this.preprocessImage(imagePath);
      
      const { data: { text } } = await Tesseract.recognize(
        processedPath,
        'eng',
        { logger: m => console.log('OCR Progress:', m.progress) }
      );

      const parsedData = await groqService.parseInvoiceOCR(text);
      
      return {
        rawText: text,
        parsedData
      };
    } catch (error) {
      console.error('OCR Processing Error:', error);
      throw error;
    } finally {
      // Clean up processed image
      if (processedPath && fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
    }
  }
};

module.exports = ocrService;
