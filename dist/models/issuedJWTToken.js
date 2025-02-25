"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const database_1 = require("../consts/database");
// Схема
const issuedJWTTokenSchema = new mongoose_1.Schema({
    jti: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    // deviceId: { 
    //     type: String,
    //     required: true
    // },
    revoked: {
        type: Boolean,
        default: false // По умолчанию токен не отозван
    },
    expiredAt: {
        type: Date,
        required: true
    }
}, {
    versionKey: false
});
const IssuedJWTTokenModel = database_1.database.model('IssuedJWTToken', issuedJWTTokenSchema);
exports.default = IssuedJWTTokenModel;
//# sourceMappingURL=issuedJWTToken.js.map