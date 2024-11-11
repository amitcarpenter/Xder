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
        console.log(result)

        const updatedNotifications = result.map(notification => {
            if (
                notification.notification_image &&
                !notification.notification_image.startsWith("http") &&
                !notification.notification_image.startsWith("No image")
            ) {
                notification.notification_image = `${process.env.APP_URL}${notification.notification_image}`;
            }
            return notification;
        });

        return handleSuccess(res, 200, 'Notifications fetched successfully.', updatedNotifications);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const { notification_id } = req.params;
        const query = 'SELECT * FROM admin_notifications WHERE notification_id = ?;';
        const result = await pool.query(query, [notification_id]);
        console.log(result)
        if (result.length === 0) {
            return handleError(res, 404, 'Notification not found.');
        }
        const notification = result[0];
        if (
            notification.notification_image &&
            !notification.notification_image.startsWith("http") &&
            !notification.notification_image.startsWith("No image")
        ) {
            notification.notification_image = `${process.env.APP_URL}${notification.notification_image}`;
        }
        return handleSuccess(res, 200, 'Notification fetched successfully.', notification);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const notificationSchema = Joi.object({
            notification_title: Joi.string().required(),
            notification_id: Joi.number().required(),
            notification_message: Joi.string().required(),
            notification_scheduled_time: Joi.date().optional(),
        });
        const { error } = notificationSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);

        const query_get_notification = 'SELECT * FROM admin_notifications WHERE notification_id = ?;';
        const result_get_notification = await pool.query(query_get_notification, [notification_id]);
        console.log(result_get_notification)

        const { notification_id, notification_title, notification_message, notification_scheduled_time } = req.body;
        let notification_image = result_get_notification.notification_image;
        if (req.file) {
            notification_image = req.file.filename;
        }
        const query = `
            UPDATE admin_notifications
            SET notification_image = COALESCE(?, notification_image), 
                notification_title = ?, 
                notification_message = ?, 
                notification_scheduled_time = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE notification_id = ?;
        `;
        const values = [notification_image || null, notification_title, notification_message, notification_scheduled_time, notification_id];
        const result = await pool.query(query, values);


        if (result.rows.length === 0) {
            return handleError(res, 404, 'Notification not found.');
        }

        return handleSuccess(res, 200, 'Notification updated successfully.', result);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { notification_id } = req.params;
        const query = 'DELETE FROM admin_notifications WHERE notification_id = ? RETURNING *;';
        const result = await pool.query(query, [notification_id]);

        if (result.rows.length === 0) {
            return handleError(res, 404, 'Notification not found.');
        }
        handleSuccess(res, 200, 'Notification deleted successfully.');
    } catch (err) {
        handleError(res, 500, 'Error deleting notification.');
    }
};

