const Joi = require('joi');
require("dotenv").config();
const ejs = require("ejs");
const path = require("path");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../../utils/database");
const { sendEmail } = require("../../utils/emailService");
const { fetchAdminByEmail, registerAdmin } = require('../../models/admin/auth');
const { joiErrorHandle, handleError, handleSuccess } = require('../../utils/responseHandler');


const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const image_logo = process.env.LOGO_URL
const APP_URL = process.env.APP_URL



exports.get_all_users = async (req, res) => {
    try {
        const users = await db.query('SELECT * FROM users WHERE is_delete != 1 ORDER BY created_at DESC');
        const updatedUsers = users.map(user => {
            if (user.profile_image && !user.profile_image.startsWith("http") && !user.profile_image.startsWith("No image")) {
                user.profile_image = `${process.env.APP_URL}${user.profile_image}`;
            }
            return user;
        });
        return handleSuccess(res, 200, "User retrieved successfully", updatedUsers);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

exports.get_all_filtered_users = async (req, res) => {
    try {
        const { country, city, gender, is_blocked, search } = req.query;
        let query = 'SELECT * FROM users WHERE is_delete != 1';
        const queryParams = [];

        if (country && country.trim()) {
            query += ' AND country = ?';
            queryParams.push(country);
        }

        if (city && city.trim()) {
            query += ' AND city = ?';
            queryParams.push(city);
        }

        if (gender && gender.trim()) {
            query += ' AND gender = ?';
            queryParams.push(gender);
        }

        if (typeof is_blocked !== 'undefined' && is_blocked !== '') {
            query += ' AND is_blocked = ?';
            queryParams.push(is_blocked ? 1 : 0);
        }

        if (search && search.trim()) {
            query += ' AND (name LIKE ? OR username LIKE ? OR city LIKE ? OR country LIKE ? OR gender LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const users = await db.query(query, queryParams);
        const updatedUsers = users.map(user => {
            if (user.profile_image && !user.profile_image.startsWith("http") && !user.profile_image.startsWith("No image")) {
                user.profile_image = `${process.env.APP_URL}${user.profile_image}`;
            }
            return user;
        });

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

// exports.delete_user = async (req, res) => {
//     try {
//         const blockUserSchema = Joi.object({
//             user_id: Joi.number().required(),
//         });
//         const { error, value } = blockUserSchema.validate(req.body);
//         if (error) return joiErrorHandle(res, error);
//         const { user_id, block_status } = value;
//         const [user] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
//         if (!user) return handleError(res, 404, "User Not Found");
//         await db.query(`UPDATE users SET is_delete = 1 WHERE id = ?`, [user_id]);
//         const message = "User Deleted Successfully";
//         return handleSuccess(res, 200, message);
//     } catch (error) {
//         return handleError(res, 500, error.message);
//     }
// };


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

