const pool = require('../../utils/database');
const { handleSuccess, handleError, joiErrorHandle } = require('../../utils/responseHandler');
const Joi = require('joi');


// exports.getAllSubscriptions = async (req, res) => {
//     try {
//         const query = `
//             SELECT s.*, u.*, sp.*
//             FROM user_subscription s
//             LEFT JOIN users u ON s.user_id = u.id
//             LEFT JOIN subscription_plan sp ON s.subscription_id = sp.id;
//         `;
//         const result = await pool.query(query);
//         if (result.length === 0) {
//             return handleError(res, 404, 'No subscriptions found.');
//         }
//         return handleSuccess(res, 200, 'Subscriptions fetched successfully.', result);
//     } catch (error) {
//         return handleError(res, 500, error.message);
//     }
// };


exports.getAllSubscriptions = async (req, res) => {
    try {
        const { plan_name, plan_type } = req.query;
        let query = `
            SELECT s.*, u.*, sp.*
            FROM user_subscription s
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN subscription_plan sp ON s.subscription_id = sp.id
        `;

        const conditions = [];
        const values = [];

        if (plan_name) {
            conditions.push("sp.plan_name = ?");
            values.push(plan_name);
        }

        if (plan_type) {
            conditions.push("sp.plan_type = ?");
            values.push(plan_type);
        }
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        const [result] = await pool.query(query, values);
        if (result.length === 0) {
            return handleError(res, 404, 'No subscriptions found.');
        }
        return handleSuccess(res, 200, 'Subscriptions fetched successfully.', result);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};
