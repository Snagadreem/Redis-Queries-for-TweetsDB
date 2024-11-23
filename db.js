const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function connectMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('ieeevisTweets');
  } catch (e) {
    console.error('MongoDB connection error:', e);
    process.exit(1);
  }
}

module.exports = { connectMongo, client };