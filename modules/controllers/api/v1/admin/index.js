const {body, validationResult} = require('express-validator');
const Admin = require("../../../../models/admin");
module.exports = new class AdminController {
    async index(req, res) {
        try {
            const admins = await Admin.find({});
            res.json(admins)
        } catch (error) {
            console.error('Error fetching users:', error);
            res.json(error)
        }
    }

    async single(req, res) {
        const {user_name} = req.params;
        try {
            const admins = await Admin.find({user_name});
            res.json(admins)
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    async create(req, res) {
        const result = validationResult(req);

        if (result) {
             return res.status(422).json(result.array());
        }

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




    }
}



