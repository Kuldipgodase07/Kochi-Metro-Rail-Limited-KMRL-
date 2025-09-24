// Script to insert trainsets into MongoDB localhost
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const uri = 'mongodb://localhost:27017';
const dbName = 'kmrl';
const collectionName = 'trainsets';
const dataPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../data/trainsets.json');

async function insertTrainsets() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const trainsets = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    // Remove existing trainsets for clean insert
    await collection.deleteMany({});
    const result = await collection.insertMany(trainsets);
    console.log(`Inserted ${result.insertedCount} trainsets.`);
  } catch (err) {
    console.error('Error inserting trainsets:', err);
  } finally {
    await client.close();
  }
}

insertTrainsets();
