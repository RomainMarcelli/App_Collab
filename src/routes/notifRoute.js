const express = require('express');
const router = express.Router();
const { createNotifFromRequest, getAllNotifs, getUpcomingNotifications, deleteNotif, updateNotifTime } = require('../controllers/notifController');

// Route pour créer une notification
router.post('/notif', createNotifFromRequest);

// Route pour récupérer toutes les notifications
router.get('/notif', getAllNotifs);

router.get('/notifications', getUpcomingNotifications);

router.delete('/notif/:id', deleteNotif);

router.put('/notif/:id', updateNotifTime);

module.exports = router;
