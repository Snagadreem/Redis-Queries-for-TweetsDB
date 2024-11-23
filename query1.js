console.log('query1.js');
const { connectMongo } = require('./db');
const { connectRedis, client: redisClient } = require('./redisClient');

async function query1() {
    const db = await connectMongo();
    await connectRedis();

    const tweets = db.collection('tweet');
    await redisClient.set('tweetCount', 0);
    const cursor = tweets.find({});

    while (await cursor.hasNext()) {
        await cursor.next();
        await redisClient.incr('tweetCount');
    }
    const tweetCount = await redisClient.get('tweetCount');
    console.log('Total tweets:', tweetCount);

    await redisClient.quit();
    await db.client.close();
}

query1();