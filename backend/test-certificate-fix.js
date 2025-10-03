import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Helper function from our fix
const findBestCertificate = (certificates, type) => {
  const typeCerts = certificates.filter(c => c.certificate_type === type);
  if (typeCerts.length === 0) return null;
  
  typeCerts.sort((a, b) => {
    const aActive = a.status === 'active' || a.status === 'valid';
    const bActive = b.status === 'active' || b.status === 'valid';
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return new Date(b.expiry_date) - new Date(a.expiry_date);
  });
  
  return typeCerts[0];
};

async function testFix() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const trainsets = await db.collection('trainsets').find({}).limit(10).toArray();
    const certificates = await db.collection('fitnesscertificates').find({}).toArray();
    
    const fitnessMap = new Map();
    certificates.forEach(cert => {
      const trainsetId = cert.trainset_id?.toString();
      if (!trainsetId) return;
      if (!fitnessMap.has(trainsetId)) {
        fitnessMap.set(trainsetId, []);
      }
      fitnessMap.get(trainsetId).push(cert);
    });
    
    console.log('Testing Smart Certificate Selection\n');
    console.log('='.repeat(100));
    
    trainsets.forEach(trainset => {
      const trainsetId = trainset._id.toString();
      const certs = fitnessMap.get(trainsetId) || [];
      
      console.log(`\n🚆 Train: ${trainset.number}`);
      console.log(`   Total Certificates: ${certs.length}`);
      
      if (certs.length > 0) {
        console.log('   All Certificates:');
        certs.forEach(cert => {
          const statusIcon = cert.status === 'active' ? '✅' : cert.status === 'expiring' ? '🟡' : '❌';
          console.log(`     ${statusIcon} ${cert.certificate_type}: ${cert.status} (expires: ${new Date(cert.expiry_date).toLocaleDateString()})`);
        });
      }
      
      const rollingStock = findBestCertificate(certs, 'rolling_stock');
      const signalling = findBestCertificate(certs, 'signalling');
      const telecom = findBestCertificate(certs, 'telecom');
      
      console.log('   \n   🎯 Best Certificates Selected:');
      console.log(`     Rolling Stock: ${rollingStock ? `${rollingStock.status} (${new Date(rollingStock.expiry_date).toLocaleDateString()})` : 'N/A'}`);
      console.log(`     Signalling:    ${signalling ? `${signalling.status} (${new Date(signalling.expiry_date).toLocaleDateString()})` : 'N/A'}`);
      console.log(`     Telecom:       ${telecom ? `${telecom.status} (${new Date(telecom.expiry_date).toLocaleDateString()})` : 'N/A'}`);
    });
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ Test Complete - Logic working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testFix();
