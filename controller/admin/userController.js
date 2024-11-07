const Joi = require('joi');
require("dotenv").config();
const ejs = require("ejs");
const path = require("path");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../../utils/database");
const sendEmail = require("../../utils/emailService");
const { fetchAdminByEmail, registerAdmin } = require('../../models/admin/auth');
const { joiErrorHandle, handleError, handleSuccess } = require('../../utils/responseHandler');


const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const image_logo = process.env.LOGO_URL
const APP_URL = process.env.APP_URL



exports.get_all_users = async (req, res) => {
    try {
        const users = await db.query('SELECT * FROM users ORDER BY created_at DESC');
        const updatedUsers = users.map(user => {
            if (user.profile_image && !user.profile_image.startsWith("http") && !user.profile_image.startsWith("No image")) {
                user.profile_image = `${process.env.APP_URL}${user.profile_image}`;
            }
            return user;
        });
        return handleSuccess(res, 200, "User data retrieved successfully", updatedUsers);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.get_all_users = async (req, res) => {
    try {
        const users = await db.query('SELECT * FROM users ORDER BY created_at DESC');
        const updatedUsers = users.map(user => {
            if (user.profile_image && !user.profile_image.startsWith("http") && !user.profile_image.startsWith("No image")) {
                user.profile_image = `${process.env.APP_URL}${user.profile_image}`;
            }
            return user;
        });
        return handleSuccess(res, 200, "User data retrieved successfully", updatedUsers);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.block_unblock_user = async (req, res) => {
    try {
        const blockUserSchema = Joi.object({
            user_id: Joi.number().required(),
            block_status: Joi.boolean().required(),
        });
        const { error, value } = blockUserSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);
        const { user_id, block_status } = value;
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
        if (!user) {
            return handleError(res, 404, "User Not Found");
        }
        await db.query(
            `UPDATE users SET is_blocked = ? WHERE id = ?`,
            [block_status ? 1 : 0, user_id]
        );
        const message = block_status ? "User blocked successfully" : "User unblocked successfully";
        return handleSuccess(res, 200, message);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};



