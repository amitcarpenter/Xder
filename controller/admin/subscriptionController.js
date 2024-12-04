const { base_url } = require('../../config');
const { profileimages } = require('../../models/users');
const pool = require('../../utils/database');
const { handleSuccess, handleError, joiErrorHandle } = require('../../utils/responseHandler');
const Joi = require('joi');

// exports.getAllSubscriptions = async (req, res) => {
//     try {
//         const { plan_name, plan_type } = req.query;

//         let result = await get_user_subscription_data(plan_name, plan_type)
//         if (result.length === 0) {
//             return handleError(res, 404, 'No subscriptions found.');
//         }

//         await Promise.all(
//             result.map(async (user) => {
//                 await get_user_data_by_id(user.user_id)
//                 await get_plan_data_by_id(user.user_id)
//             })
//         )

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
            WHERE 
                s.sub_status = '1' 
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

        const result = await pool.query(query, values);

        // let query = `
        //         SELECT 
        //             s.*, 
        //             u.*, 
        //             sp.* 
        //         FROM 
        //             user_subscription s
        //         LEFT JOIN 
        //             users u ON s.user_id = u.id
        //         LEFT JOIN 
        //             subscription_plan sp ON s.subscription_id = sp.id
        //         WHERE 
        //             s.start_date IS NOT NULL
        //             AND s.expired_at < CURRENT_DATE
        //         `;

        // if (plan_name) {
        //     query += ` AND sp.plan_name = ?`;
        // }
        // if (plan_type) {
        //     query += ` AND sp.plan_type = ?`;
        // }

        // const values = [];
        // if (plan_name) values.push(plan_name);
        // if (plan_type) values.push(plan_type);

        // const result = await pool.query(query, values);


        if (result.length === 0) {
            return handleError(res, 404, 'No subscriptions found.');
        }


        const updated_subscription = await Promise.all(
            result.map(async (user) => {
                const profileImages = await profileimages(user.user_id);
                user.images = profileImages?.length > 0
                    ? profileImages.map(imageObj => imageObj.image ? `${base_url}/profile/${imageObj.image}` : "")
                    : [];
                return user;
            })
        );
        return handleSuccess(res, 200, 'Subscriptions fetched successfully.', updated_subscription);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

