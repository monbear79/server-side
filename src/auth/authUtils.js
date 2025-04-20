'use strict'

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response');

//service 
const { findByAdminId } = require('../services/keyToken.service');

const HEADER = {
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // Access token
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '1 hour'
        });

        // Refresh token
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        });

        // Verify token
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error(`Error verifying token::`, err);
            } else {
                console.log(`Decode verify token::`, decode);
            }
        });

        return { accessToken, refreshToken };
    } catch (error) {
    }
}

//ver1
// const authentication = asyncHandler ( async (req, res, next) =>{
//     /*
//         - 1 Check adminId missing???
//         - 2 get accessToken
//         - 3 verifyToken
//         - 4 check admin in dbs
//         - 5 check keyStore with this adminId
//         - 6 OK all => return next()
//     */
//     //1
//     const adminId = req.headers[HEADER.CLIENT_ID]
//     if (!adminId) throw new AuthFailureError('Invalid Request!')
    
//     //2
//     const keyStore = await findByAdminId( adminId )
//     if(!keyStore) throw new NotFoundError('Not Found keyStore!')

//     //3
//     const accessToken = req.headers[HEADER.AUTHORIZATION]
//     if (!accessToken) throw new AuthFailureError('Invalid Request!')
    
//     try {
//         const decodeAdmin = JWT.verify( accessToken, keyStore.publicKey)
//         if(adminId !== decodeAdmin.adminId) throw new AuthFailureError('Invalid AdminId!')
//             req.keyStore = keyStore
//             return next() 
//     } catch (error) {
//         throw error
//     }


// })

//ver2
const authenticationV2 = asyncHandler(async (req, res, next) => {
/*  - 1 Check adminId missing???
    - 2 get accessToken
    - 3 verifyToken
    - 4 check admin in dbs
    - 5 check keyStore with this adminId
    - 6 OK all => return next()
*/
    //1
    const adminId = req.headers[HEADER.CLIENT_ID];
    if (!adminId) throw new AuthFailureError('Invalid Request!');
    //2
    const keyStore = await findByAdminId(adminId);
    if (!keyStore) throw new NotFoundError('Not Found keyStore!');
    //3
    const refreshToken = req.headers[HEADER.REFRESHTOKEN] || req.headers[HEADER.AUTHORIZATION];
    if (refreshToken) {
        try {
            const decodeAdmin = JWT.verify(refreshToken, keyStore.privateKey);
            if (adminId !== decodeAdmin.adminId) throw new AuthFailureError('Invalid AdminId!');
            req.keyStore = keyStore;
            req.admin = decodeAdmin; // {admin, email}
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            throw error;
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError('Invalid Request!');

    try {
        const decodeAdmin = JWT.verify(accessToken, keyStore.publicKey);
        if (adminId !== decodeAdmin.adminId) throw new AuthFailureError('Invalid AdminId!');
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});


const verifyJWT = async (token, keySecret) =>{
    return await JWT.verify(token, keySecret )
}

module.exports = { 
    createTokenPair, 
    authenticationV2,
    verifyJWT
};
