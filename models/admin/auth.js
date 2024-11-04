const db = require("../../utils/database");

module.exports = {
    fetchAdminByEmail: async (email) => {
        const query = `SELECT * FROM tbl_admin WHERE email = ?`;
        try {
            const result = await db.query(query, [email]);
            console.log(result);
            return result ? result : null;
        } catch (error) {
            console.error("Database query error:", error);
            return null;
        }
    },

    registerAdmin: async (adminData) => {
        const query = `INSERT INTO tbl_admin SET ?`;
        try {
            const result = await db.query(query, adminData);
            return result && result.affectedRows > 0 ? result.insertId : null;
        } catch (error) {
            console.error("Database insertion error:", error);
            return null;
        }
    },
};
