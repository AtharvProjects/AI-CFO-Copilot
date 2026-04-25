const Groq = require('groq-sdk');
const NodeCache = require('node-cache');
require('dotenv').config({ path: './.env' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

const groqService = {
  /**
   * General Groq chat completion wrapper with caching
   */
  async getChatCompletion(messages, model = 'llama-3.1-8b-instant', jsonMode = false) {
    const cacheKey = JSON.stringify({ messages, model, jsonMode });
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      console.log('Serving from cache:', cacheKey);
      return cachedResponse;
    }

    try {
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 0.2,
        response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
      });

      const result = completion.choices[0]?.message?.content || '';
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Groq API Error:', error);
      throw error;
    }
  },

  /**
   * Streams responses for the AI CFO Chat
   */
  async streamCfoChat(messages, res, onComplete) {
    try {
      const stream = await groq.chat.completions.create({
        messages,
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        stream: true,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        res.write(content);
      }
      res.end();
      if (onComplete) {
        onComplete(fullResponse);
      }
    } catch (error) {
      console.error('Groq Stream Error:', error);
      res.status(500).send('Error communicating with AI CFO');
    }
  },

  /**
   * Parse OCR text to extract invoice details
   */
  async parseInvoiceOCR(ocrText) {
    const prompt = `
    Extract the following from this OCR text of an invoice into JSON format:
    vendor, invoice_date (YYYY-MM-DD), invoice_number, total (in numeric), tax (in numeric), gstin, and line_items (array of {description, amount}).
    If a field is missing, return null.
    OCR Text: ${ocrText}
    `;

    const result = await this.getChatCompletion(
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant',
      true
    );

    return JSON.parse(result);
  },

  /**
   * Categorize a transaction based on its description
   */
  async categorizeTransaction(description) {
    const prompt = `
    Categorize this transaction description into ONE of the following categories:
    Food, Transport, Salaries, Tax, Utilities, Rent, Office Supplies, Software, Marketing, Other.
    Respond with ONLY the category name in JSON format like {"category": "..."}.
    Description: "${description}"
    `;

    const result = await this.getChatCompletion(
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant',
      true
    );

    return JSON.parse(result).category || 'Other';
  },

  /**
   * Generate 2-sentence narrative for cash flow forecast
   */
  async generateForecastNarrative(data) {
    const prompt = `
    Based on this data (avg income: ${data.avgIncome}, avg expense: ${data.avgExpense}, runway: ${data.runway} days), 
    write a 2-sentence financial health summary for an MSME. Keep it actionable.
    `;

    return await this.getChatCompletion(
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant'
    );
  }
};

module.exports = groqService;
