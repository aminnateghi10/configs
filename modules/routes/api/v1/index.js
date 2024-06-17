const express = require("express");

const router = express.Router();

const Admin = require("../../../models/admin");

router.get("/admins", async (req, res) => {
    try {
        const admins = await Admin.find({});
        res.json(admins)
    } catch (error) {
        console.error('Error fetching users:', error);
    }
});
router.get("/admin", async (req, res) => {
    const {user_name} = req.params;
    try {
        const admins = await Admin.find({user_name});
        res.json(admins)
    } catch (error) {
        console.error('Error fetching users:', error);
    }
});

router.post('/admin', (req, res) => {
    const {name, user_name, password} = req.body;
    const newAdmin = new Admin({name, user_name, password});

    newAdmin.save()
        .then(admin => {
            res.status(201).json(admin);
        })
        .catch(error => {
            console.error('Error creating admin:', error);
            res.status(500).json({error: 'Error creating admin'});
        });
});

module.exports = router;
