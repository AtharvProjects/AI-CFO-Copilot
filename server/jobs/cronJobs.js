const cron = require('node-cron');
const supabase = require('../supabaseClient');
const socketService = require('../services/socketService');
const forecastService = require('../services/forecastService');

const initCronJobs = () => {
  // 1. GST Reminders: Run on 10th and 19th of every month at 9:00 AM
  cron.schedule('0 9 10,19 * *', async () => {
    console.log('Running GST Reminder Cron Job...');
    try {
      // Get all active users
      const { data: users, error } = await supabase.from('users').select('id');
      if (error) throw error;

      const today = new Date().getDate();
      const filingType = today === 10 ? 'GSTR-1' : 'GSTR-3B';
      const dueDate = today === 10 ? '11th' : '20th';

      for (const user of users) {
        const alert = {
          user_id: user.id,
          type: 'gst_due',
          severity: 'high',
          message: `${filingType} filing is due tomorrow (${dueDate}). Please ensure all transactions are categorized.`,
        };

        await supabase.from('alerts').insert([alert]);
        socketService.emitAlert(user.id, alert.type, alert);
      }
    } catch (err) {
      console.error('Error in GST Reminder Cron:', err);
    }
  });

  // 2. Low Balance Check: Run daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running Low Balance Check Cron Job...');
    try {
      const { data: users, error } = await supabase.from('users').select('id');
      if (error) throw error;

      for (const user of users) {
        const forecast = await forecastService.generateForecast(user.id);
        
        if (forecast.runway < 7) {
          const alert = {
            user_id: user.id,
            type: 'low_balance',
            severity: 'high',
            message: `Warning: Your cash runway is only ${forecast.runway} days based on recent averages.`,
          };

          await supabase.from('alerts').insert([alert]);
          socketService.emitAlert(user.id, alert.type, alert);
        }
      }
    } catch (err) {
      console.error('Error in Low Balance Cron:', err);
    }
  });

  // 3. Audit Log Cleanup: Run daily at midnight to delete logs older than 90 days
  cron.schedule('0 0 * * *', async () => {
    console.log('Running Audit Log Cleanup Cron Job...');
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', ninetyDaysAgo.toISOString());

      if (error) throw error;
      console.log('Successfully cleaned up old audit logs.');
    } catch (err) {
      console.error('Error in Audit Log Cleanup Cron:', err);
    }
  });

  // 4. Proactive Anomaly Detection (Phase 3) - Runs daily at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running Proactive Anomaly Detection Cron Job...');
    try {
      const { data: users, error: userError } = await supabase.from('users').select('id');
      if (userError) throw userError;

      // Calculate date range for the last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      for (const user of users) {
        // Fetch recent transactions
        const { data: txs, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', threeDaysAgo.toISOString().split('T')[0]);

        if (txError) continue;

        // Detect Duplicates (same amount, same date, same description)
        const duplicates = {};
        txs.forEach(tx => {
          const key = `${tx.amount}_${tx.date}_${tx.description}`;
          if (duplicates[key]) {
            duplicates[key].push(tx);
          } else {
            duplicates[key] = [tx];
          }
        });

        for (const [key, group] of Object.entries(duplicates)) {
          if (group.length > 1) {
            const alert = {
              user_id: user.id,
              type: 'anomaly_detected',
              severity: 'medium',
              message: `Anomaly: We detected ${group.length} identical charges of ₹${Math.abs(group[0].amount / 100)} for "${group[0].description}" on ${group[0].date}.`,
            };
            
            await supabase.from('alerts').insert([alert]);
            socketService.emitAlert(user.id, alert.type, alert);
          }
        }
      }
    } catch (err) {
      console.error('Error in Anomaly Detection Cron:', err);
    }
  });

  console.log('Cron jobs initialized.');
};

module.exports = initCronJobs;
