const Admin = require("../../../models/admin");
module.exports = new class Admin {
    async index(req, res) {
        try {
            const admins = await Admin.find({});
            res.json(admins)
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }
}
