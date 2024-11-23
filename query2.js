console.log('query2.js');
const { connectMongo } = require('./db');
const { connectRedis, client: redisClient } = require('./redisClient');

async function query2() {
    const db = await connectMongo();
    await connectRedis();

    const tweets = db.collection('tweet');
    await redisClient.set('favoriteSum', 0);
    const cursor = tweets.find({});

    while (await cursor.hasNext()) {
        const tweet = await cursor.next();
        const favoriteCount = tweet.favorite_count;
        await cursor.next();
        await redisClient.incrBy('favoriteSum', favoriteCount);
    }
    const favoriteSum = await redisClient.get('favoriteSum');
    console.log('Total favorites:', favoriteSum);

    await redisClient.quit();
    await db.client.close();
}

query2();