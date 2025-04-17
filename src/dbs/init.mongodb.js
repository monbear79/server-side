'use strict';

const mongoose = require('mongoose');
const { db: { uri } } = require('../configs/config.mongodb');
const { countConnect } = require('../helpers/check.connect');

console.log(`Full connection string:`, uri);

class Database {

    constructor() {
        this.connect();
    }
    
    // Connect
    connect() {
        mongoose.set('debug', true);
        mongoose.set('debug', { color: true });

        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 50
         })
         .then(async () => {
            console.log(`Connected to MongoDB Atlas successfully`, countConnect());
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Current Collections:', collections.map(c => c.name));
        })
         .catch(err => {
            console.log(`Error Connect!`, err);
        });
    }
    
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
