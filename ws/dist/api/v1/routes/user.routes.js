"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Protected route - requires authentication
router.get('/me', auth_middleware_1.authenticate, user_controller_1.getCurrentUser);
exports.default = router;
