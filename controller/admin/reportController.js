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
            SELECT reports.*, 
                sender.id AS sender_id, sender.name AS sender_name, sender.profile_image AS sender_profile_image,
                receiver.id AS receiver_id, receiver.name AS receiver_name, receiver.profile_image AS receiver_profile_image
            FROM reports
            LEFT JOIN users AS sender
                ON sender.id = reports.sender_id
            LEFT JOIN users AS receiver
                ON receiver.id = reports.receiver_id;
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




