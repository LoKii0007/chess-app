"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 12;
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if username already exists
        const existingUser = yield db_1.default.user.findUnique({
            where: { username: payload.username },
        });
        if (existingUser) {
            throw new Error('Username already exists');
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(payload.password, SALT_ROUNDS);
        // Create user
        const user = yield db_1.default.user.create({
            data: {
                fName: payload.fName,
                lName: payload.lName,
                username: payload.username,
                password: hashedPassword,
            },
            select: {
                id: true,
                fName: true,
                lName: true,
                username: true,
            },
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return {
            user,
            token,
        };
    }
    catch (error) {
        if (error.message === 'Username already exists') {
            throw error;
        }
        console.error('Error registering user:', error);
        throw new Error('Failed to register user');
    }
});
exports.registerUser = registerUser;
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by username
        const user = yield db_1.default.user.findUnique({
            where: { username: payload.username },
            select: {
                id: true,
                fName: true,
                lName: true,
                username: true,
                password: true,
            },
        });
        if (!user) {
            throw new Error('Invalid username or password');
        }
        // Verify password
        const isPasswordValid = yield bcrypt_1.default.compare(payload.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid username or password');
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // Remove password from response
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        return {
            user: userWithoutPassword,
            token,
        };
    }
    catch (error) {
        if (error.message === 'Invalid username or password') {
            throw error;
        }
        console.error('Error logging in user:', error);
        throw new Error('Failed to login user');
    }
});
exports.loginUser = loginUser;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyToken = verifyToken;
