const pool = require('../../utils/database');
const { handleSuccess, handleError, joiErrorHandle } = require('../../utils/responseHandler');
const Joi = require('joi');



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


