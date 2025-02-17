const express = require('express');
const router = express.Router();
const { createNotifFromRequest, getAllNotifs, getUpcomingNotifications  } = require('../controllers/notifController');

// Route pour créer une notification
router.post('/notif', createNotifFromRequest);

// Route pour récupérer toutes les notifications
router.get('/notif', getAllNotifs);

router.get('/notifications', getUpcomingNotifications);


module.exports = router;
