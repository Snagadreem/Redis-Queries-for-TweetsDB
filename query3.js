console.log('query3.js');
const { connectMongo } = require('./db');
const { connectRedis, client: redisClient } = require('./redisClient');

async function query3() {
    const db = await connectMongo();
    await connectRedis();

    const tweets = db.collection('tweet');
    const setKey = 'distinctUsers';
    const cursor = tweets.find({});

    while (await cursor.hasNext()) {
        const tweet = await cursor.next();
        const userid = tweet.user.id_str;
        await redisClient.sAdd(setKey, userid);
    }
    const distinctUsers = await redisClient.sCard(setKey);
    console.log('Total distinct users:', distinctUsers);

    await redisClient.quit();
    await db.client.close();
}

query3();