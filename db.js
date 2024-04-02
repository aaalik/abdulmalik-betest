const { MongoClient } = require('mongodb');

const mongoURI = 'mongodb://localhost:27017';
const dbName = 'db_abdulmalik_test';

let db;

async function connectToDB() {
    try {
        const client = await MongoClient.connect(mongoURI);
        console.log('Connected to MongoDB');
        db = client.db(dbName);
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
}

function getDB() {
    return db;
}

module.exports = { connectToDB, getDB };
