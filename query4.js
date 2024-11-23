console.log('query4.js');
const { connectMongo } = require('./db');
const { connectRedis, client: redisClient } = require('./redisClient');

async function query4() {
    const db = await connectMongo();
    await connectRedis();

    const tweets = db.collection('tweet');
    const setKey = 'leaderboard';
    await redisClient.del(setKey);
    const cursor = tweets.find({});

    while (await cursor.hasNext()) {
        const tweet = await cursor.next();
        const userid = tweet.user.id_str;
        await redisClient.zIncrBy(setKey, 1, userid);
        console.log('Incremented tweet count for user:', userid);
    }
    const setLength = await redisClient.zCard(setKey);
    const allUsers = await redisClient.zRangeWithScores(setKey, 0, setLength);
    const reversedUsers = allUsers.reverse();
    const topUsers = reversedUsers.slice(0, 10);
    console.log('Top users by tweet count:', topUsers);

    await redisClient.quit();
    await db.client.close();
}

query4();
