const supabase = require('../supabaseClient');

const auditLogger = async (req, res, next) => {
  // We only log modifying actions
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // We want to log the response status code, so we hook into the finish event
    res.on('finish', async () => {
      try {
        const userId = req.user?.userId || null; // Depends on auth middleware being run first
        const action = `${req.method} ${req.originalUrl}`;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const statusCode = res.statusCode;

        // Insert into audit_logs table (background fire-and-forget to not block the response)
        const { error } = await supabase
          .from('audit_logs')
          .insert([
            {
              user_id: userId,
              action: action,
              ip: ip,
              status_code: statusCode
            }
          ]);

        if (error) {
          console.error('Audit log error:', error.message);
        }
      } catch (err) {
        console.error('Audit log exception:', err.message);
      }
    });
  }
  
  next();
};

module.exports = auditLogger;
