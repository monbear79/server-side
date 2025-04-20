'use strict'
const { Types } = require('mongoose');
const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ adminId, publicKey, privateKey, refreshToken }) => {
    const filter = { admin: adminId };
    const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken };
    const options = { upsert: true, new: true };
    const tokens = await keytokenModel.findOneAndUpdate(filter, update, options);
    return tokens ? tokens.publicKey : null;
  }

  static findByAdminId = async (adminId) => {
    return await keytokenModel.findOne({ admin: new Types.ObjectId(adminId) });
  }

  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne({ _id: id });
  }

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshTokensUsed: refreshToken }).lean();
  }

  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken });
  }

  static deleteKeyById = async (adminId) => {
    return await keytokenModel.deleteOne({ admin: new Types.ObjectId(adminId) });
  }
}

module.exports = KeyTokenService;
