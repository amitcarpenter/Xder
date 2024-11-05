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
const { collection, getDocs } = require("firebase/firestore");
const { db_firebase } = require('../../config/firebase');


const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const image_logo = process.env.LOGO_URL
const APP_URL = process.env.APP_URL


exports.registerAdmin = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;
        const schema = Joi.object({
            email: Joi.string().min(5).max(255).email({ tlds: { allow: false } }).lowercase().required(),
            password: Joi.string().min(8).max(15).required().messages({
                "any.required": "{{#label}} is required",
                "string.empty": "Password can't be empty",
                "string.min": "Minimum 8 characters required",
                "string.max": "Maximum 15 characters allowed",
            }),
        });

        const result = schema.validate(req.body);
        if (result.error) return joiErrorHandle(res, result.error);

        const existingAdmin = await fetchAdminByEmail(email);
        if (existingAdmin) {
            return handleError(res, 400, `An account with this email (${email}) already exists. Please log in.`);
        }
        const hash = await bcrypt.hash(password, saltRounds);
        const admin = {
            email,
            password: hash,
            show_password: password,
            full_name: full_name
        };
        const create_admin = await registerAdmin(admin);
        if (create_admin) {
            return handleSuccess(res, 200, `Admin Created Successfully`, create_admin);
        }
    } catch (error) {
        console.error(error);
        return handleError(res, 500, error.message);
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const schema = Joi.object({
            email: Joi.string().min(5).max(255).email({ tlds: { allow: false } }).lowercase().required(),
            password: Joi.string().min(8).max(15).required()
        });
        const result = schema.validate(req.body);
        if (result.error) return joiErrorHandle(res, result.error);
        const existingAdmin = await fetchAdminByEmail(email);
        if (!existingAdmin) {
            return handleError(res, 400, "Invalid email or password.");
        }
        const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);
        if (!isPasswordValid) {
            return handleError(res, 400, "Invalid email or password.");
        }
        const token = jwt.sign({ id: existingAdmin.id, email: existingAdmin.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRY
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Login Successful",
            token: token
        })
    } catch (error) {
        console.error(error);
        return handleError(res, 500, "Internal server error.");
    }
};

exports.render_forgot_password_page = (req, res) => {
    try {
        return res.render("resetPasswordAdmin.ejs");
    } catch (error) {
        return handleError(res, 500, error.message)
    }
};

exports.forgot_password = async (req, res) => {
    try {
        const forgotPasswordSchema = Joi.object({
            email: Joi.string().email().required(),
        });
        const { error, value } = forgotPasswordSchema.validate(req.body);
        if (error) {
            return handleError(res, 400, error.details[0].message);
        }
        const { email } = value;
        const [admin] = await db.query(`SELECT * FROM tbl_admin WHERE email = ?`, [email]);
        if (!admin) {
            return handleError(res, 404, "Admin Not Found");
        }

        if (admin.is_verified === false) {
            return handleError(res, 400, "Please Verify your email first");
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await db.query(
            `UPDATE tbl_admin SET reset_password_token = ?, reset_password_token_expiry = ? WHERE email = ?`,
            [resetToken, resetTokenExpiry, email]
        );
        const resetLink = `${req.protocol}://${req.get("host")}/admin/reset-password?token=${resetToken}`;
        const emailTemplatePath = path.resolve(__dirname, "../../views/forgetPassword.ejs");
        const emailHtml = await ejs.renderFile(emailTemplatePath, { resetLink, image_logo });
        const emailOptions = {
            to: email,
            subject: "Password Reset Request",
            html: emailHtml,
        };
        await sendEmail(emailOptions);
        return handleSuccess(res, 200, `Password reset link sent to your email (${email}).`);
    } catch (error) {
        console.error("Error in forgot password controller:", error);
        return handleError(res, 500, error.message);
    }
};

exports.reset_password = async (req, res) => {
    try {
        const resetPasswordSchema = Joi.object({
            token: Joi.string().required(),
            newPassword: Joi.string().min(8).required().messages({
                "string.min": "Password must be at least 8 characters long",
                "any.required": "New password is required",
            }),
        });
        const { error, value } = resetPasswordSchema.validate(req.body);
        if (error) {
            return handleError(res, 400, error.details[0].message);
        }
        const { token, newPassword } = value;
        const [admin] = await db.query(
            `SELECT * FROM tbl_admin WHERE reset_password_token = ? AND reset_password_token_expiry > ?`,
            [token, new Date()]
        );
        if (!admin) {
            return handleError(res, 400, "Invalid or expired token");
        }
        if (admin.show_password === newPassword) {
            return handleError(res, 400, "Password cannot be the same as the previous password.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updateResult = await db.query(
            `UPDATE tbl_admin SET password = ?, show_password = ?, reset_password_token = NULL, reset_password_token_expiry = NULL WHERE id = ?`,
            [hashedPassword, newPassword, admin.id]
        );

        if (updateResult.affectedRows > 0) {
            return handleSuccess(res, 200, "Password reset successfully.");
        } else {
            return handleError(res, 500, "Failed to reset password.");
        }
    } catch (error) {
        console.error("Error in reset password controller:", error);
        return handleError(res, 500, error.message);
    }
};

exports.render_success_reset = (req, res) => {
    return res.render("successReset.ejs")
}

exports.getProfile = async (req, res) => {
    try {
        const adminReq = req.admin;
        const [admin] = await db.query('SELECT * FROM tbl_admin WHERE id = ?', [adminReq.id]);
        if (!admin) {
            return handleError(res, 404, "Admin Not Found");
        }
        if (admin.profile_image && !admin.profile_image.startsWith("http")) {
            admin.profile_image = `${APP_URL}${admin.profile_image}`;
        }
        return handleSuccess(res, 200, "Admin profile fetched successfully", admin);
    } catch (error) {
        console.error("Error in getProfile:", error);
        return handleError(res, 500, error.message);
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updateProfileSchema = Joi.object({
            full_name: Joi.string().required(),
        });

        const { error, value } = updateProfileSchema.validate(req.body);
        if (error) {
            return handleError(res, 400, error.details[0].message);
        }

        const { full_name } = value;
        const adminReq = req.admin;
        const [admin] = await db.query('SELECT * FROM tbl_admin WHERE id = ?', [adminReq.id]);

        if (!admin) {
            return handleError(res, 404, "Admin Not Found");
        }
        let profile_image = admin.profile_image;
        if (req.file) {
            profile_image = req.file.filename;
        }
        console.log(profile_image);

        await db.query(
            `UPDATE tbl_admin SET full_name = ?, profile_image = ? WHERE id = ?`,
            [full_name, profile_image, adminReq.id]
        );

        return handleSuccess(res, 200, "Profile updated successfully");
    } catch (error) {
        console.error("Error in updateProfile:", error);
        return handleError(res, 500, error.message);
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword || newPassword.length < 8) {
            return handleError(res, 400, "Current password and new password are required, and new password must be at least 8 characters long.");
        }
        const admin = req.admin;
        if (!admin) {
            return handleError(res, 404, "Admin Not Found");
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return handleError(res, 400, "Current password is incorrect");
        }

        if (admin.show_password === newPassword) {
            return handleError(res, 400, "Password cannot be the same as the previous password.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE tbl_admin SET password = ?, show_password = ? WHERE id = ?', [hashedPassword, newPassword, admin.id]);

        return handleSuccess(res, 200, "Password changed successfully");
    } catch (error) {
        console.error("Error in changePassword controller:", error);
        return handleError(res, 500, error.message);
    }
};

exports.dashboard_data = async (req, res) => {
    try {
        const publicChatGroupRef = collection(db_firebase, "publicChatGroup");
        const privateChatGroupRef = collection(db_firebase, "privateChatGroup");
        const publicChatDocs = await getDocs(publicChatGroupRef);
        const privateChatDocs = await getDocs(privateChatGroupRef);
        const publicChatCount = publicChatDocs.size;
        const privateChatCount = privateChatDocs.size;
        const totalChatGroupCount = publicChatCount + privateChatCount;
        const publicChats = publicChatDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const privateChats = privateChatDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const users = await db.query('SELECT * FROM users');
        const userCount = users.length || 0;

        const pro_users = await db.query(`
            SELECT *
            FROM user_subscription
            WHERE subscription_id != '1'
              AND expired_at > NOW()
              AND sub_status = 1
            GROUP BY user_id
        `);
        const pro_user_count = pro_users.length || 0;


        const data = {
            pro_user_count,
            userCount,
            totalChatGroupCount,
            publicChatGroupCount: publicChatCount,
            privateChatGroupCount: privateChatCount,
            // publicChatGroup: publicChats,
            // privateChatGroup: privateChats
        };
        return handleSuccess(res, 200, "Chat group data and count retrieved successfully", data);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};







