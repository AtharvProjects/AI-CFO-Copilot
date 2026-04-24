const Papa = require('papaparse');
const fs = require('fs');
const groqService = require('./groqService');
const alertService = require('./alertService');
const supabase = require('../supabaseClient');

const importService = {
  /**
   * Process a CSV bank statement
   */
  async processCSV(filePath, userId) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const parsedTransactions = [];
            
            for (const row of results.data) {
              // Map generic bank fields. Banks vary, so this is a simplified generic mapper.
              // Assuming standard columns like: Date, Description, Withdrawal, Deposit
              const date = row['Date'] || row['Txn Date'] || row['Value Date'];
              const description = row['Description'] || row['Narration'] || row['Remarks'] || 'Unknown';
              const withdrawal = parseFloat(row['Withdrawal'] || row['Debit'] || '0');
              const deposit = parseFloat(row['Deposit'] || row['Credit'] || '0');
              
              if (!date || (withdrawal === 0 && deposit === 0)) continue;

              const type = deposit > 0 ? 'income' : 'expense';
              // Store amount in paise
              const amount = type === 'income' ? deposit * 100 : withdrawal * 100;

              // Use Groq to auto-categorize
              const category = await groqService.categorizeTransaction(description);

              const txObj = {
                user_id: userId,
                type,
                amount,
                category,
                description,
                date: new Date(date).toISOString(),
                payment_mode: 'Bank Transfer'
              };

              // Insert to DB
              const { data: insertedTx, error } = await supabase
                .from('transactions')
                .insert([txObj])
                .select()
                .single();

              if (error) {
                console.error('Error inserting row:', error.message);
                continue;
              }

              // Run fraud/anomaly checks
              await alertService.runChecks(insertedTx);
              
              parsedTransactions.push(insertedTx);
            }
            
            resolve({ success: true, count: parsedTransactions.length });
          } catch (err) {
            reject(err);
          } finally {
            // Clean up uploaded file
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
};

module.exports = importService;
