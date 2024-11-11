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



// exports.get_all_report = async (req, res) => {
//     try {
//         const query = `
//             SELECT r.*, 
//                    sender.*,   -- Select all sender fields
//                    receiver.*  -- Select all receiver fields
//             FROM reports r
//             LEFT JOIN users sender ON r.sender_id = sender.id
//             LEFT JOIN users receiver ON r.reciver_id = receiver.id;
//         `;

//         const reports = await db.query(query);

//         const updatedReports = reports.map(report => {
//             // Handle profile images and convert to full URL if needed
//             const processImage = (image) => {
//                 if (image && !image.startsWith("http") && !image.startsWith("No image")) {
//                     return `${process.env.APP_URL}${image}`;
//                 }
//                 return image;
//             };

//             const sender = Object.keys(report).reduce((acc, key) => {
//                 if (key.startsWith("sender_")) {
//                     acc[key.replace("sender_", "")] = processImage(report[key]);
//                 }
//                 return acc;
//             }, {});

//             const receiver = Object.keys(report).reduce((acc, key) => {
//                 if (key.startsWith("receiver_")) {
//                     acc[key.replace("receiver_", "")] = processImage(report[key]);
//                 }
//                 return acc;
//             }, {});

//             // Return the report with sender and receiver as objects
//             return {
//                 ...report,
//                 sender,   // dynamic sender object
//                 receiver, // dynamic receiver object
//             };
//         });

//         return handleSuccess(res, 200, "Reports retrieved successfully", updatedReports);
//     } catch (error) {
//         return handleError(res, 500, error.message);
//     }
// };



exports.get_all_report = async (req, res) => {
    try {
        const query = `
        SELECT r.*, 
            sender.id AS sender_id,
            sender.name AS sender_name,
            sender.username AS sender_username,
            sender.email AS sender_email,
            sender.password AS sender_password,
            sender.show_password AS sender_show_password,
            sender.age AS sender_age,
            sender.gender AS sender_gender,
            sender.DOB AS sender_DOB,
            sender.body_type AS sender_body_type,
            sender.relationship_status AS sender_relationship_status,
            sender.looking_for AS sender_looking_for,
            sender.meet_at AS sender_meet_at,
            sender.height AS sender_height,
            sender.weight AS sender_weight,
            sender.online_status AS sender_online_status,
            sender.incognito_mode AS sender_incognito_mode,
            sender.app_verify AS sender_app_verify,
            sender.has_photo AS sender_has_photo,
            sender.dont_disturb AS sender_dont_disturb,
            sender.social_id AS sender_social_id,
            sender.social_login AS sender_social_login,
            sender.chat_notification AS sender_chat_notification,
            sender.group_notification AS sender_group_notification,
            sender.taps_notification AS sender_taps_notification,
            sender.video_Call_notification AS sender_video_Call_notification,
            sender.profile_image AS sender_profile_image,
            sender.phone_number AS sender_phone_number,
            sender.fcm_token AS sender_fcm_token,
            sender.verify_user AS sender_verify_user,
            sender.phone_verify AS sender_phone_verify,
            sender.OTP AS sender_OTP,
            sender.OTP_forgot AS sender_OTP_forgot,
            sender.about_me AS sender_about_me,
            sender.country AS sender_country,
            sender.city AS sender_city,
            sender.tags AS sender_tags,
            sender.ethnicity AS sender_ethnicity,
            sender.tribes AS sender_tribes,
            sender.sex AS sender_sex,
            sender.pronouns AS sender_pronouns,
            sender.relationship_type AS sender_relationship_type,
            sender.covid_19 AS sender_covid_19,
            sender.token AS sender_token,
            sender.about AS sender_about,
            sender.act_token AS sender_act_token,
            sender.update_at AS sender_update_at,
            sender.twitter_link AS sender_twitter_link,
            sender.instagram_link AS sender_instagram_link,
            sender.facebook_link AS sender_facebook_link,
            sender.complete_profile_status AS sender_complete_profile_status,
            sender.created_at AS sender_created_at,
            sender.block_status AS sender_block_status,
            sender.latitude AS sender_latitude,
            sender.longitude AS sender_longitude,
            sender.last_seen AS sender_last_seen,
            sender.sexual_orientation AS sender_sexual_orientation,
            sender.linkedIn_link AS sender_linkedIn_link,
            sender.sub_gender AS sender_sub_gender,
            sender.CountryCode AS sender_CountryCode,
            sender.is_blocked AS sender_is_blocked,
            sender.is_delete AS sender_is_delete,
            sender.is_reviewed AS sender_is_reviewed,
            sender.is_verified AS sender_is_verified,
            sender.verification_image AS sender_verification_image,
            receiver.id AS receiver_id,
            receiver.name AS receiver_name,
            receiver.username AS receiver_username,
            receiver.email AS receiver_email,
            receiver.password AS receiver_password,
            receiver.show_password AS receiver_show_password,
            receiver.age AS receiver_age,
            receiver.gender AS receiver_gender,
            receiver.DOB AS receiver_DOB,
            receiver.body_type AS receiver_body_type,
            receiver.relationship_status AS receiver_relationship_status,
            receiver.looking_for AS receiver_looking_for,
            receiver.meet_at AS receiver_meet_at,
            receiver.height AS receiver_height,
            receiver.weight AS receiver_weight,
            receiver.online_status AS receiver_online_status,
            receiver.incognito_mode AS receiver_incognito_mode,
            receiver.app_verify AS receiver_app_verify,
            receiver.has_photo AS receiver_has_photo,
            receiver.dont_disturb AS receiver_dont_disturb,
            receiver.social_id AS receiver_social_id,
            receiver.social_login AS receiver_social_login,
            receiver.chat_notification AS receiver_chat_notification,
            receiver.group_notification AS receiver_group_notification,
            receiver.taps_notification AS receiver_taps_notification,
            receiver.video_Call_notification AS receiver_video_Call_notification,
            receiver.profile_image AS receiver_profile_image,
            receiver.phone_number AS receiver_phone_number,
            receiver.fcm_token AS receiver_fcm_token,
            receiver.verify_user AS receiver_verify_user,
            receiver.phone_verify AS receiver_phone_verify,
            receiver.OTP AS receiver_OTP,
            receiver.OTP_forgot AS receiver_OTP_forgot,
            receiver.about_me AS receiver_about_me,
            receiver.country AS receiver_country,
            receiver.city AS receiver_city,
            receiver.tags AS receiver_tags,
            receiver.ethnicity AS receiver_ethnicity,
            receiver.tribes AS receiver_tribes,
            receiver.sex AS receiver_sex,
            receiver.pronouns AS receiver_pronouns,
            receiver.relationship_type AS receiver_relationship_type,
            receiver.covid_19 AS receiver_covid_19,
            receiver.token AS receiver_token,
            receiver.about AS receiver_about,
            receiver.act_token AS receiver_act_token,
            receiver.update_at AS receiver_update_at,
            receiver.twitter_link AS receiver_twitter_link,
            receiver.instagram_link AS receiver_instagram_link,
            receiver.facebook_link AS receiver_facebook_link,
            receiver.complete_profile_status AS receiver_complete_profile_status,
            receiver.created_at AS receiver_created_at,
            receiver.block_status AS receiver_block_status,
            receiver.latitude AS receiver_latitude,
            receiver.longitude AS receiver_longitude,
            receiver.last_seen AS receiver_last_seen,
            receiver.sexual_orientation AS receiver_sexual_orientation,
            receiver.linkedIn_link AS receiver_linkedIn_link,
            receiver.sub_gender AS receiver_sub_gender,
            receiver.CountryCode AS receiver_CountryCode,
            receiver.is_blocked AS receiver_is_blocked,
            receiver.is_delete AS receiver_is_delete,
            receiver.is_reviewed AS receiver_is_reviewed,
            receiver.is_verified AS receiver_is_verified,
            receiver.verification_image AS receiver_verification_image,
            COUNT(r.id) AS report_count
        FROM reports r
        LEFT JOIN users sender ON r.sender_id = sender.id
        LEFT JOIN users receiver ON r.reciver_id = receiver.id
        GROUP BY receiver.id;`;

        const reports = await db.query(query);

        const updatedReports = reports.map(report => {
            return {
                ...report,
                report_count: report.report_count
            };
        });

        return handleSuccess(res, 200, "Reports retrieved successfully", updatedReports);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};





