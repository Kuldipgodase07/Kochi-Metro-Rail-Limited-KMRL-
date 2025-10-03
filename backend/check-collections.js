import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Available Collections:');
    console.log('========================');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Check each collection for sample data
    console.log('\n📊 Sample Data from Each Collection:');
    console.log('====================================');
    
    for (const col of collections) {
      const collectionName = col.name;
      const sampleDoc = await db.collection(collectionName).findOne({});
      console.log(`\n🔹 ${collectionName}:`);
      
      if (sampleDoc) {
        console.log('  Sample document fields:', Object.keys(sampleDoc).join(', '));
        console.log('  Sample data:', JSON.stringify(sampleDoc, null, 2).substring(0, 500));
      } else {
        console.log('  ⚠️  Collection is empty');
      }
      
      const count = await db.collection(collectionName).countDocuments();
      console.log(`  Total documents: ${count}`);
    }
    
    // Specifically check trainsets collection
    console.log('\n\n🚆 TRAINSETS COLLECTION ANALYSIS:');
    console.log('=================================');
    const trainsets = await db.collection('trainsets').find({}).limit(2).toArray();
    trainsets.forEach(train => {
      console.log('\nTrain Document:');
      console.log(JSON.stringify(train, null, 2));
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
}

checkCollections();
