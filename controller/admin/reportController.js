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
const { collection, doc, deleteDoc, getDocs, getDoc, updateDoc } = require("firebase/firestore");
const { db_firebase } = require('../../config/firebase');
const { profileimages, delete_group_report } = require('../../models/users');
const { base_url } = require('../../config');


const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const image_logo = process.env.LOGO_URL
const APP_URL = process.env.APP_URL


exports.get_all_report_user = async (req, res) => {
    try {
        const get_report_query = 'SELECT * FROM reports where reciver_id != 0 ORDER BY id DESC';
        const reports = await db.query(get_report_query);

        const updatedReports = await Promise.all(reports.map(async (report) => {
            const sender_query = 'SELECT * FROM users WHERE id = ?';
            const receiver_query = 'SELECT * FROM users WHERE id = ?';
            const [sender] = await db.query(sender_query, [report.sender_id]);
            const [receiver] = await db.query(receiver_query, [report.reciver_id]);

            const profileImages = await profileimages(receiver.id);
            receiver.images = profileImages?.length > 0
                ? profileImages.map(imageObj => imageObj.image ? `${base_url}/profile/${imageObj.image}` : "")
                : [];

            return {
                ...report,
                sender,
                receiver
            };
        }));

        return handleSuccess(res, 200, "Reports retrieved successfully", updatedReports);
    } catch (error) {
        return handleError(res, 500, "Error retrieving reports: " + error.message);
    }
};

const get_group_data_by_id = async (groupId) => {
    const collectionNames = ['privateChatGroup', 'publicChatGroup'];
    for (const collectionName of collectionNames) {
        const chatGroupRef = collection(db_firebase, collectionName);
        const groupDoc = await getDoc(doc(chatGroupRef, groupId));

        if (groupDoc.exists()) {
            return { id: groupDoc.id, ...groupDoc.data() };
        }
    }
    throw new Error("Chat group not found");
};

exports.get_all_group_reports = async (req, res) => {
    try {
        const get_report_query = 'SELECT * FROM reports WHERE group_id != 0 ORDER BY id DESC';
        const reports = await db.query(get_report_query);
        const updatedReports = await Promise.all(reports.map(async (report) => {
            const sender_query = 'SELECT * FROM users WHERE id = ?';
            const [sender] = await db.query(sender_query, [report.sender_id]);

            let group_data = null;
            let admin_data = null;
            try {
                group_data = await get_group_data_by_id(report.group_id);
                if (group_data) {
                    const get_admin_data = `SELECT * FROM users WHERE id = ${group_data.adminId}`;
                    [admin_data] = await db.query(get_admin_data);
                }
            } catch (firebaseError) {
                console.error("Error fetching group data:", firebaseError.message);
            }

            return {
                ...report,
                sender,
                group_data,
                admin_data
            };
        }));

        return handleSuccess(res, 200, "Reports retrieved successfully", updatedReports);
    } catch (error) {
        console.error("Error retrieving reports:", error.message);
        return handleError(res, 500, "Error retrieving reports: " + error.message);
    }
};

const delete_group_by_id = async (groupId, isPrivateGroup = true) => {
    const collectionName = isPrivateGroup ? 'privateChatGroup' : 'publicChatGroup';
    const chatGroupRef = collection(db_firebase, collectionName);
    const groupDocRef = doc(chatGroupRef, groupId);
    const groupDoc = await getDoc(groupDocRef);
    if (!groupDoc.exists()) {
        throw new Error("Chat group not found");
    }
    await deleteDoc(groupDocRef);
    return { message: "Group deleted successfully", id: groupId };
};

// const delete_group_by_id = async (groupId, isPrivateGroup = true) => {
//     try {
//         const collectionName = isPrivateGroup ? 'privateChatGroup' : 'publicChatGroup';
//         const groupDocPath = `${collectionName}/${groupId}`;

//         // Recursively delete the document and all its subcollections
//         await admin.firestore().recursiveDelete(admin.firestore().doc(groupDocPath));

//         return { message: "Group and its subcollections deleted successfully", id: groupId };
//     } catch (error) {
//         console.error("Error deleting group:", error);
//         throw new Error("Failed to delete the group and its subcollections");
//     }
// };

exports.delete_chat_group = async (req, res) => {
    try {
        const deleteGroupSchema = Joi.object({
            group_id: Joi.string().required(),
            group_type: Joi.string().valid("private", "public").optional().allow("").allow(null)
        })

        const { error, value } = deleteGroupSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);
        const { group_id, group_type } = value;

        const isPrivateGroup = group_type === 'private';

        try {
            const result = await delete_group_by_id(group_id, isPrivateGroup);
        } catch (error) {
            console.log(error.message)
        }
        const delete_group = delete_group_report(group_id)
        return handleSuccess(res, 200, "Group deleted successfully");
    } catch (error) {
        console.error("Error deleting group:", error.message);
        return handleError(res, 500, "Error deleting group: " + error.message);
    }
};


