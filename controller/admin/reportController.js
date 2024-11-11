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



exports.get_all_report = async (req, res) => {
    try {
        const query = `
            SELECT s.*, u.*, sp.*
            FROM reports r
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN subscription_plan sp ON s.subscription_id = sp.id
        `;

        const reports = await db.query(query);

        const updatedReports = reports.map(report => {
            if (report.sender_profile_image && !report.sender_profile_image.startsWith("http") && !report.sender_profile_image.startsWith("No image")) {
                report.sender_profile_image = `${process.env.APP_URL}${report.sender_profile_image}`;
            }

            if (report.receiver_profile_image && !report.receiver_profile_image.startsWith("http") && !report.receiver_profile_image.startsWith("No image")) {
                report.receiver_profile_image = `${process.env.APP_URL}${report.receiver_profile_image}`;
            }


            return {
                ...report,
            };
        });
        return handleSuccess(res, 200, "Reports retrieved successfully", updatedReports);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};




