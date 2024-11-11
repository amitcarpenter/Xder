// controllers/adminNotificationController.js
const { error } = require('winston');
const pool = require('../../utils/database');
const { handleSuccess, handleError, joiErrorHandle } = require('../../utils/responseHandler');
const Joi = require('joi');


exports.createNotification = async (req, res) => {
    try {
        const notificationSchema = Joi.object({
            notification_title: Joi.string().required(),
            notification_message: Joi.string().required(),
            notification_scheduled_time: Joi.date().optional(),
        });

        const { error } = notificationSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);

        let notification_image = "";
        if (req.file) {
            notification_image = req.file.filename;
        }

        const { notification_title, notification_message, notification_scheduled_time } = req.body;

        const query = `
            INSERT INTO admin_notifications (notification_image, notification_title, notification_message, notification_scheduled_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;
        const values = [notification_image, notification_title, notification_message, notification_scheduled_time];
        let saved_notification = await pool.query(query, values);
        if (saved_notification.affectedRows > 0) {
            return handleSuccess(res, 201, 'Notification created successfully.');
        }
        return;
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};


exports.getAllNotifications = async (req, res) => {
    try {
        const query = 'SELECT * FROM admin_notifications ORDER BY created_at DESC;';
        const result = await pool.query(query);
        handleSuccess(res, 200, 'Notifications fetched successfully.', result.rows);
    } catch (err) {
        handleError(res, 500, 'Error fetching notifications.');
    }
};


exports.getNotificationById = async (req, res) => {
    try {
        const { notification_id } = req.params;
        const query = 'SELECT * FROM admin_notifications WHERE notification_id = $1;';
        const result = await pool.query(query, [notification_id]);

        if (result.rows.length === 0) {
            return handleError(res, 404, 'Notification not found.');
        }
        handleSuccess(res, 200, 'Notification fetched successfully.', result.rows[0]);
    } catch (err) {
        handleError(res, 500, 'Error fetching notification.');
    }
};

// // Update Notification
// const updateNotification = async (req, res) => {
//     try {
//         const { notification_id } = req.params;
//         const { error } = notificationSchema.validate(req.body);
//         if (error) return joiErrorHandle(res, error);

//         const { notification_image, notification_title, notification_message, notification_scheduled_time } = req.body;
//         const query = `
//       UPDATE admin_notifications
//       SET notification_image = $1, notification_title = $2, notification_message = $3, notification_scheduled_time = $4, updated_at = CURRENT_TIMESTAMP
//       WHERE notification_id = $5
//       RETURNING *;
//     `;
//         const values = [notification_image, notification_title, notification_message, notification_scheduled_time, notification_id];
//         const result = await pool.query(query, values);

//         if (result.rows.length === 0) {
//             return handleError(res, 404, 'Notification not found.');
//         }
//         handleSuccess(res, 200, 'Notification updated successfully.', result.rows[0]);
//     } catch (err) {
//         handleError(res, 500, 'Error updating notification.');
//     }
// };

// // Delete Notification
// const deleteNotification = async (req, res) => {
//     try {
//         const { notification_id } = req.params;
//         const query = 'DELETE FROM admin_notifications WHERE notification_id = $1 RETURNING *;';
//         const result = await pool.query(query, [notification_id]);

//         if (result.rows.length === 0) {
//             return handleError(res, 404, 'Notification not found.');
//         }
//         handleSuccess(res, 200, 'Notification deleted successfully.');
//     } catch (err) {
//         handleError(res, 500, 'Error deleting notification.');
//     }
// };

