const { profileimages } = require('../../models/users');
const pool = require('../../utils/database');
const { handleSuccess, handleError, joiErrorHandle } = require('../../utils/responseHandler');
const Joi = require('joi');
const config = require("../../config.js");


const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const image_logo = process.env.LOGO_URL
const APP_URL = process.env.APP_URL

const baseurl = config.base_url;
const Fcm_serverKey = config.fcm_serverKey;
const googledistance_key = config.googledistance_key;


exports.uploadVerificationImage = async (req, res) => {
    try {
        const uploadImageSchema = Joi.object({
            user_id: Joi.number().required()
        })
        const { error, value } = uploadImageSchema.validate(req.body)
        if (error) return joiErrorHandle(res, error);
        const { user_id } = value

        if (!req.file) {
            return handleError(res, 400, 'No file uploaded.');
        }

        const verification_image = req.file.filename;
        const query = `
            UPDATE users 
            SET verification_image = ? 
            WHERE id = ?;
        `;
        const values = [verification_image, user_id];
        const result = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return handleError(res, 404, 'User not found.');
        }
        return handleSuccess(res, 200, 'Verification image uploaded successfully.', { verification_image });
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.getUsersWithVerificationImage = async (req, res) => {
    try {
        const query = `
            SELECT u.* 
            FROM users u
            WHERE u.verification_image IS NOT NULL 
            AND u.verification_image != ''
            AND u.is_verified = 2
            GROUP BY u.id
            ORDER BY u.created_at DESC;
        `;
        const result = await pool.query(query);
        if (result.length === 0) {
            return handleError(res, 404, 'No users with verification image found.');
        }
        const updatedUsers = await Promise.all(result.map(async (user) => {
            const profileImages = await profileimages(user.id);
            user.images = profileImages?.length > 0
                ? profileImages.map(imageObj =>
                    imageObj.image ? `${process.env.APP_URL}/profile/${imageObj.image}` : "")
                : [];

            if (user.verification_image && !user.verification_image.startsWith("http") && user.verification_image !== "No image") {
                user.verification_image = `${process.env.APP_URL}${user.verification_image}`;
            }
            return user;
        }));

        return handleSuccess(res, 200, 'Users with verification images fetched successfully.', updatedUsers);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const verificationSchema = Joi.object({
            user_id: Joi.number().required()
        })
        const { error, value } = verificationSchema.validate(req.body)
        if (error) return joiErrorHandle(res, error);
        const { user_id } = value
        const query = `
            UPDATE users 
            SET is_verified = true 
            WHERE id = ?;
        `;
        const result = await pool.query(query, [user_id]);
        if (result.affectedRows === 0) {
            return handleError(res, 404, 'User not found or already verified.');
        }
        return handleSuccess(res, 200, 'User verified successfully.');
    } catch (error) {
        return handleError(res, 500, 'Error updating verification status.');
    }
};
