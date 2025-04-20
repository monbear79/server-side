'use strict'

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Admin';
const COLLECTION_NAME = 'Admins';

const adminSchema = new Schema({
    name: {
        type: String,
        trim: true,
        maxLength: 150,
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: { // trạng thái hoạt động của admin
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    // Vì hệ thống chỉ có admin nên role mặc định là ADMIN
    roles: {
        type: [String],
        default: ['ADMIN']
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, adminSchema);
