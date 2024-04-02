const express = require('express');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const { connectToDB, getDB } = require('./db');
const { checkCache, setCache } = require('./redis');

const app = express();
app.use(bodyParser.json());

connectToDB();

const dbCollection = 'users';

// GET all users
app.get('/api/users', checkCache, async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection(dbCollection).find({}).toArray();

        setCache(req.originalUrl, users);
        
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET a specific user by ID
app.get('/api/users/:id', checkCache, async (req, res) => {
    try {
        const db = getDB();
        const userId = req.params.id;

        const user = await db.collection(dbCollection).findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        setCache(req.originalUrl, user);

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET a specific user by accountNumber
app.get('/api/users/accnumber/:id', checkCache, async (req, res) => {
    try {
        const db = getDB();
        const id = req.params.id;

        const user = await db.collection(dbCollection).findOne({ accountNumber: parseInt(id) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        setCache(req.originalUrl, user);

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET a specific user by identityNumber
app.get('/api/users/idnumber/:id',  async (req, res) => {
    try {
        const db = getDB();
        const id = req.params.id;

        const user = await db.collection(dbCollection).findOne({ identityNumber: parseInt(id)});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // setCache(req.originalUrl, user);

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST - Create a new user
app.post('/api/users', async (req, res) => {
    try {
        const db = getDB();
        const newUser = req.body;
        const result = await db.collection(dbCollection).insertOne(newUser);
        newUser._id = result.insertedId;
        newUser.id = result.insertedId;

        await db.collection(dbCollection).updateOne({ _id: new ObjectId(result.insertedId) }, { $set: newUser });

        const users = await db.collection(dbCollection).find({}).toArray();
        setCache(req.originalUrl, users);

        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT - Update an existing user
app.put('/api/users/:id', async (req, res) => {
    try {
        const db = getDB();
        const userId = req.params.id;
        const updateUser = req.body;
        await db.collection(dbCollection).updateOne({ _id: new ObjectId(userId) }, { $set: updateUser });
        setCache(req.originalUrl, updateUser);
        res.json(updateUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE - Delete a user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const db = getDB();
        const userId = req.params.id;
        await db.collection(dbCollection).deleteOne({ _id: new ObjectId(userId) });
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
