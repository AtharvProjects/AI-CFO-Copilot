let ioInstance = null;

const socketService = {
  init(io) {
    ioInstance = io;
  },

  emitAlert(userId, alertType, alertData) {
    if (ioInstance) {
      // Emit to the specific user's room
      ioInstance.to(userId.toString()).emit('new_alert', {
        type: alertType,
        ...alertData,
        timestamp: new Date()
      });
      console.log(`Alert emitted to user ${userId}:`, alertType);
    } else {
      console.error('Socket.io instance not initialized in socketService.');
    }
  }
};

module.exports = socketService;
