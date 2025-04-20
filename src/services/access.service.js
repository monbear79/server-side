'use strict'

const adminModel = require("../models/admin.model");
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, ForbiddenError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./admin.service");

const RoleAdmin = { ADMIN: 'ADMIN' };

class AccessService {
  static handleRefreshTokenV2 = async ({ keyStore, admin, refreshToken }) => {
    const { adminId, email } = admin;
    if (!Array.isArray(keyStore.refreshTokensUsed)) {
      keyStore.refreshTokensUsed = [];
    }
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(adminId);
      throw new ForbiddenError('Refresh token was used. Please login again!');
    }
    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError('Invalid refresh token!');
    }
    const foundAdmin = await findByEmail({ email });
    if (!foundAdmin) {
      throw new AuthFailureError('Admin not registered!');
    }
    const tokens = await createTokenPair({ adminId, email }, keyStore.publicKey, keyStore.privateKey);
    await keyStore.updateOne({
      $set: { refreshToken: tokens.refreshToken },
      $addToSet: { refreshTokensUsed: refreshToken }
    });
    return { admin, tokens };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    const foundAdmin = await findByEmail({ email });
    if (!foundAdmin) throw new BadRequestError('Admin not registered!');
    const match = await bcrypt.compare(password, foundAdmin.password);
    if (!match) throw new AuthFailureError('Authentication error!');
    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');
    const { _id: adminId } = foundAdmin;
    const tokens = await createTokenPair({ adminId, email }, publicKey, privateKey);
    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      adminId
    });
    return {
      admin: getInfoData({ fields: ['_id', 'name', 'email'], object: foundAdmin }),
      tokens
    };
  };

  static signUp = async ({ name, email, password }) => {
    const existingAdmin = await adminModel.findOne({ email }).lean();
    if (existingAdmin) {
      throw new BadRequestError('Error: Admin already registered!');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await adminModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleAdmin.ADMIN]
    });
    if (newAdmin) {
      const privateKey = crypto.randomBytes(64).toString('hex');
      const publicKey = crypto.randomBytes(64).toString('hex');
      const keyStore = await KeyTokenService.createKeyToken({
        adminId: newAdmin._id,
        publicKey,
        privateKey
      });
      if (!keyStore) {
        return { code: 'xxxx', message: 'KeyStore error!' };
      }
      const tokens = await createTokenPair({ adminId: newAdmin._id, email }, publicKey, privateKey);
      return {
        code: 201,
        metadata: {
          admin: getInfoData({ fields: ['_id', 'name', 'email'], object: newAdmin }),
          tokens
        }
      };
    }
    return { code: 200, metadata: null };
  };
}

module.exports = AccessService;
