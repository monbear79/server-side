'use strict'

// level 0

// const config = {
//     app: {
//         port: 3000
//     },
//     db: {
//         host: 'localhost',
//         port: 27017,
//         name: 'db'
//     }
// }

// level 1

const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3052
    },
    db: {
        uri: process.env.DEV_DB_URI || 'mongodb+srv://admin:admin123@cluster0.nd9qqgk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
        // host: process.env.DEV_DB_HOST  || 'localhost',
        // port: process.env.DEV_DB_PORT  || 27017,
        // name: process.env.DEV_DB_NAME  || 'shopDEV'
    }
}

const pro = {
    app: {
        port: process.env.PRO_APP_PORT || 3000
    },  
    db: {
        uri: process.env.PRO_DB_URI || 'mongodb+srv://admin:admin123@cluster0.nd9qqgk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
        // host: process.env.PRO_DB_HOST  || 'localhost',
        // port: process.env.PRO_DB_PORT  || 27017,
        // name: process.env.PRO_DB_NAME 7 || 'shopPRO'
    }
}


const config = { dev, pro }
const env = process.env.NODE_ENV || 'dev'

// console.log(config[env], env)
module.exports = config[env]