const { createClient } = require('redis');

const client = createClient();

client.on('error', (e) => {
    console.log('Redis error:', e);
});

async function connectRedis() {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (e) {
        console.error('Redis connection error:', e);
        process.exit(1);
    }
}

module.exports = { connectRedis, client };