const redis = require('redis');

const redisHost = 'localhost';
const redisPort = 6379;

const redisClient = redis.createClient({
    host: redisHost,
    port: redisPort,
    legacyMode: true
});

redisClient.on('error', err => console.log('Redis Client Error', err));

function checkCache(req, res, next) {
    const key = req.originalUrl;
    redisClient.connect().then(() => {
        redisClient.get(key, (err, data) => {
            if (err) {
                console.error('Redis get error:', err);
                res.status(500).json({ message: 'Internal server error' });
                return;
            }
            redisClient.disconnect();

            if (data !== null) {
                res.json(JSON.parse(data));
                return;
            } else {
                next();
            }
        });
    }).catch((err) => {
        console.log(err.message);
    })
}

function setCache(key, data) {
    redisClient.connect().then(() => {
        redisClient.setEx(key, 3600, JSON.stringify(data), err => {
            if (err) {
                console.error('Redis setex error:', err);
            }
            redisClient.disconnect();
        });
    }).catch((err) => {
        console.log(err.message);
    })
}

module.exports = { checkCache, setCache };