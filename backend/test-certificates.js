import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function testCertificates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;
    
    // Get sample trainsets
    const trainsets = await db.collection('trainsets').find({}).limit(10).toArray();
    console.log(`Found ${trainsets.length} trainsets\n`);
    
    // Get all certificates
    const certificates = await db.collection('fitnesscertificates').find({}).toArray();
    console.log(`Found ${certificates.length} total certificates\n`);
    
    // Create map
    const fitnessMap = new Map();
    certificates.forEach(cert => {
      const trainsetId = cert.trainset_id?.toString();
      if (!trainsetId) return;
      if (!fitnessMap.has(trainsetId)) {
        fitnessMap.set(trainsetId, []);
      }
      fitnessMap.get(trainsetId).push(cert);
    });
    
    console.log('Certificate Distribution:\n');
    console.log('='.repeat(80));
    
    trainsets.forEach(trainset => {
      const trainsetId = trainset._id.toString();
      const certs = fitnessMap.get(trainsetId) || [];
      
      const rollingStock = certs.find(c => c.certificate_type === 'rolling_stock');
      const signalling = certs.find(c => c.certificate_type === 'signalling');
      const telecom = certs.find(c => c.certificate_type === 'telecom');
      
      console.log(`\nTrain: ${trainset.number} (ID: ${trainsetId})`);
      console.log(`  Total Certificates: ${certs.length}`);
      console.log(`  Rolling Stock: ${rollingStock ? '✅' : '❌'}`);
      console.log(`  Signalling:    ${signalling ? '✅' : '❌'}`);
      console.log(`  Telecom:       ${telecom ? '✅' : '❌'}`);
      
      if (certs.length > 0) {
        console.log(`  Certificate Details:`);
        certs.forEach(cert => {
          console.log(`    - ${cert.certificate_type}: expires ${cert.expiry_date}, status: ${cert.status}`);
        });
      }
    });
    
    // Check certificate type distribution
    const typeCount = {
      rolling_stock: 0,
      signalling: 0,
      telecom: 0,
      other: 0
    };
    
    certificates.forEach(cert => {
      if (cert.certificate_type === 'rolling_stock') typeCount.rolling_stock++;
      else if (cert.certificate_type === 'signalling') typeCount.signalling++;
      else if (cert.certificate_type === 'telecom') typeCount.telecom++;
      else typeCount.other++;
    });
    
    console.log('\n\n' + '='.repeat(80));
    console.log('Certificate Type Statistics:');
    console.log('='.repeat(80));
    console.log(`Rolling Stock: ${typeCount.rolling_stock}`);
    console.log(`Signalling:    ${typeCount.signalling}`);
    console.log(`Telecom:       ${typeCount.telecom}`);
    console.log(`Other/Unknown: ${typeCount.other}`);
    console.log(`Total:         ${certificates.length}`);
    
    // Check for trains without any certificates
    const trainsWithoutCerts = trainsets.filter(t => {
      const certs = fitnessMap.get(t._id.toString()) || [];
      return certs.length === 0;
    });
    
    if (trainsWithoutCerts.length > 0) {
      console.log(`\n⚠️  ${trainsWithoutCerts.length} trains have NO certificates:`);
      trainsWithoutCerts.forEach(t => console.log(`  - ${t.number}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
}

testCertificates();
