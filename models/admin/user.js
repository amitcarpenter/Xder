const db = require("../../utils/database");
const config = require("../../config");
const baseurl = config.base_url;

module.exports = {

    get_all_users_admin: async () => {
        let where = ""
        return db.query(
            `select * from users where complete_profile_status = 1 ${where}  ORDER BY id DESC `
        );
    },

    get_all_filtered_users: async (country, city, gender, is_blocked, search) => {
        try {
            console.log(country, city, gender, is_blocked, search);

            // Start the base query
            let query = 'SELECT * FROM users';
            const queryParams = [];

            // Track if we need to add a WHERE clause
            let hasCondition = false;

            // Add filters dynamically
            if (country && country.trim()) {
                query += hasCondition ? ' AND country = ?' : ' WHERE country = ?';
                queryParams.push(country);
                hasCondition = true;
            }
            if (city && city.trim()) {
                query += hasCondition ? ' AND city = ?' : ' WHERE city = ?';
                queryParams.push(city);
                hasCondition = true;
            }
            if (gender && gender.trim()) {
                query += hasCondition ? ' AND gender = ?' : ' WHERE gender = ?';
                queryParams.push(gender);
                hasCondition = true;
            }
            if (typeof is_blocked !== 'undefined' && is_blocked !== '') {
                query += hasCondition ? ' AND is_blocked = ?' : ' WHERE is_blocked = ?';
                queryParams.push(is_blocked ? 1 : 0);
                hasCondition = true;
            }
            if (search && search.trim()) {
                query += hasCondition
                    ? ' AND (name LIKE ? OR username LIKE ? OR city LIKE ? OR country LIKE ? OR gender LIKE ?)'
                    : ' WHERE (name LIKE ? OR username LIKE ? OR city LIKE ? OR country LIKE ? OR gender LIKE ?)';
                queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
                hasCondition = true;
            }
            query += ' ORDER BY created_at DESC';
            return await db.query(query, queryParams);
        } catch (error) {
            console.error('Error in get_all_filtered_users:', error.message);
            throw error;
        }
    }


}