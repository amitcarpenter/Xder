const { getSelectedColumn } = require('../../models/common');
const { fetchUserBy_Id, get_user_language, addnotification, fetch_fcm } = require('../../models/users');
const pool = require('../../utils/database');
const { notification_language_translations } = require('../../utils/notification_messages');
const { handleSuccess, handleError, joiErrorHandle } = require('../../utils/responseHandler');
const Joi = require('joi');
const userFcm = require('../../utils/firebaseAdminUser.js');



// exports.uploadVerificationImage = async (req, res) => {
//     try {
//         const uploadImageSchema = Joi.object({
//             user_id: Joi.number().required()
//         })
//         const { error, value } = uploadImageSchema.validate(req.body)
//         if (error) return joiErrorHandle(res, error);
//         const { user_id } = value

//         if (!req.file) {
//             return handleError(res, 400, 'No file uploaded.');
//         }

//         const verification_image = req.file.filename;
//         const query = `
//             UPDATE users 
//             SET verification_image = ? 
//             SET is_verified = 2 
//             WHERE id = ?;
//         `;
//         const values = [verification_image, user_id];
//         const result = await pool.query(query, values);

//         if (result.affectedRows === 0) {
//             return handleError(res, 404, 'User not found.');
//         }
//         return handleSuccess(res, 200, 'Verification image uploaded successfully.', { verification_image });
//     } catch (error) {
//         return handleError(res, 500, error.message);
//     }
// };


exports.uploadVerificationImage = async (req, res) => {
    try {
        const uploadImageSchema = Joi.object({
            user_id: Joi.number().required()
        });
        const { error, value } = uploadImageSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);
        const { user_id } = value;

        if (!req.file) {
            return handleError(res, 400, 'No file uploaded.');
        }

        const verification_image = req.file.filename;
        const query = `
            UPDATE users 
            SET verification_image = ?, is_verified = 2
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


exports.send_notification_on_verify = async (user_id) => {
    try {
        let [user_language] = await get_user_language(user_id)
        let final_user_language = user_language.language
        let verify_notification_response = notification_language_translations[final_user_language].verify
        const Get_fcm = await fetch_fcm(user_id);

        const send_notification = {
            user_id: user_id,
            sender_id: 0,
            reciver_id: user_id,
            body: "Your Account is Verified Successfully",
            notification_type: "verify",
        };

        console.log("first")
        const message = {
            token: Get_fcm[0].fcm_token,
            notification: {
                title: verify_notification_response.title,
                body: verify_notification_response.body,
            },
            data: {
                sender_id: `${0}`,
                reciver_id: `${user_id}`,
                screen: 'Account Verified',
            },
        };
        console.log("second")

        try {
            let response = null;
            try {
                console.log("third")
                response = await userFcm.messaging().send(message);
            } catch (error) {
                console.log("fourth")
                console.error(error.message)
            }
            console.log('Successfully sent message:', response);
            await addnotification(send_notification);
        } catch (error) {
            console.error('Error sending message:', error);
        }

    } catch (error) {
        console.error(error)
    }

}
