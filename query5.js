console.log('query5.js');
const { connectMongo } = require('./db');
const { connectRedis, client: redisClient } = require('./redisClient');

async function query5(user) {
    const db = await connectMongo();
    await connectRedis();

    const tweetsCollection = db.collection('tweet');
    
    const cursor = tweetsCollection.find({});
    while (await cursor.hasNext()) {
        const tweet = await cursor.next();

        const tweetId = tweet._id.toString();
        const screen_name = tweet.user.screen_name;
        
        await redisClient.rPush(`tweets:${screen_name}`, tweetId);

        await redisClient.hSet(`tweet:${tweetId}`, {
            user_name: tweet.user.screen_name,
            text: tweet.text,
            created_at: tweet.created_at,
            retweet_count: tweet.retweet_count,
            favorite_count: tweet.favorite_count,
            lang: tweet.lang
        });
    }
    const userTweetIds = await redisClient.lRange(`tweets:${user}`, 0, -1);
    const userTweets = [];
    for (let tweetId of userTweetIds) {
        const tweet = await redisClient.hGetAll(`tweet:${tweetId}`);

        userTweets.push({
            tweetId,
            user_name: tweet.user_name,
            text: tweet.text,
            created_at: tweet.created_at,
            retweet_count: parseInt(tweet.retweet_count, 10),
            favorite_count: parseInt(tweet.favorite_count, 10),
            lang: tweet.lang
        });
    }

    console.log(`Tweets for user @${user}:`);
    userTweets.forEach((tweet, index) => {
        console.log(`${index + 1}. ${tweet.text} (Created at: ${tweet.created_at}, Retweets: ${tweet.retweet_count}, Favorites: ${tweet.favorite_count}, Language: ${tweet.lang})`);
    });

    await redisClient.quit();
    await db.client.close();
}

query5('duto_guerra');