"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Register validator
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        fName: zod_1.z
            .string()
            .min(1, 'First name is required')
            .max(50, 'First name must be less than 50 characters')
            .trim(),
        lName: zod_1.z
            .string()
            .min(1, 'Last name is required')
            .max(50, 'Last name must be less than 50 characters')
            .trim(),
        username: zod_1.z
            .string()
            .min(1, 'Username is required')
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username must be less than 30 characters')
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
            .trim()
            .toLowerCase(),
        password: zod_1.z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters')
            .max(100, 'Password must be less than 100 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    }),
});
// Login validator
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z
            .string()
            .min(1, 'Username is required')
            .trim()
            .toLowerCase(),
        password: zod_1.z
            .string()
            .min(1, 'Password is required'),
    }),
});
