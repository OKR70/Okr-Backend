"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const database_1 = require("../consts/database");
// Схема
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    login: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["dean", "professor", "student"]
    }
}, {
    versionKey: false
});
const UserModel = database_1.database.model('User', userSchema);
exports.default = UserModel;
//# sourceMappingURL=user.js.map