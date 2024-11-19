const Joi = require('joi');
require("dotenv").config();
const ejs = require("ejs");
const path = require("path");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../../config.js");
const db = require("../../utils/database");
const { sendEmail } = require("../../utils/emailService");
const { get_all_users, profileimages } = require('../../models/users');
const { fetchAdminByEmail, registerAdmin } = require('../../models/admin/auth');
const { joiErrorHandle, handleError, handleSuccess } = require('../../utils/responseHandler');
const { get_all_users_admin, get_all_filtered_users } = require('../../models/admin/user.js');


const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const image_logo = process.env.LOGO_URL
const APP_URL = process.env.APP_URL

const baseurl = config.base_url;
const Fcm_serverKey = config.fcm_serverKey;
const googledistance_key = config.googledistance_key;


exports.get_all_users = async (req, res) => {
    try {
        console.log("get all user called in the xder admin")
        const users = await get_all_users_admin();
        const updatedUsers = await Promise.all(
            users.map(async (user) => {
                const profileImages = await profileimages(user.id);
                user.images = profileImages?.length > 0
                    ? profileImages.map(imageObj => imageObj.image ? `${baseurl}/profile/${imageObj.image}` : "")
                    : [];
                return user;
            })
        );
        return handleSuccess(res, 200, "Users retrieved successfully", updatedUsers);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.get_all_filtered_users = async (req, res) => {
    try {
        const { country, city, gender, is_blocked, search } = req.query;
        const users = await get_all_filtered_users(country, city, gender, is_blocked, search);
        if (!users) return handleError(res, 404, "Users Not Found")
        const updatedUsers = await Promise.all(
            users.map(async (user) => {
                const profileImages = await profileimages(user.id);
                user.images = profileImages?.length > 0
                    ? profileImages.map(imageObj => imageObj.image ? `${baseurl}/profile/${imageObj.image}` : "")
                    : [];
                return user;
            })
        )
        return handleSuccess(res, 200, "User retrieved successfully", updatedUsers);
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

exports.delete_user = async (req, res) => {
    try {
        const blockUserSchema = Joi.object({
            user_id: Joi.number().required(),
        });
        const { error, value } = blockUserSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);

        const { user_id } = value;
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
        if (!user) return handleError(res, 404, "User Not Found");

        await db.query('DELETE FROM users WHERE id = ?', [user_id]);
        const message = "User Deleted Successfully";
        return handleSuccess(res, 200, message);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

