const bcrypt = require('bcrypt');
const Joi = require('joi');
require("dotenv").config();
const { fetchAdminByEmail, registerAdmin } = require('../../models/admin/auth');
const { joiErrorHandle, handleError, handleSuccess } = require('../../utils/responseHandler');
const saltRounds = 10;

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY


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
        return handleSuccess(res, 200, "Login successful", token);
    } catch (error) {
        console.error(error);
        return handleError(res, 500, "Internal server error.");
    }
};

