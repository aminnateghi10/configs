const {query} = require("express-validator");
const express = require("express");

const router = express.Router();

let {api: ControllerRouter} = config.path.controller;
const AdminController = require(`${ControllerRouter}/v1/admin`);

router.get("/admins", AdminController.index);
router.get("/admin", AdminController.single);
router.post('/admin', query('user').notEmpty().escape(), AdminController.create);

module.exports = router;
