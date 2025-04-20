'use strict'

const AccessService = require("../services/access.service")

const {CREATED, SuccessResponse} = require('../core/success.response')

class AccessController {
    handleRefreshToken = async (req, res, next) =>{
        // new SuccessResponse({
        //     message: 'Get Token Success!',
        //     metadata: await AccessService.handleRefreshToken( req.body.refreshToken )
        // }).send(res)
        //ver 2 fixed, no need accessToken
        new SuccessResponse({
                message: 'Get Token Success!',
                metadata: await AccessService.handleRefreshTokenV2( {
                    refreshToken: req.refreshToken,
                    admin: req.admin,
                    keyStore: req.keyStore
                })
            }).send(res)
    }
     
    login = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Login Success!',
            metadata: await AccessService.login( req.body )
        }).send(res)
    }

    logout = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Logout Success!',
            metadata: await AccessService.logout( req.keyStore )
        }).send(res)
    }

    signUp = async (req, res, next) => {

        new CREATED({
            message: 'Registered OK!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res)
    }
} 

module.exports = new AccessController()