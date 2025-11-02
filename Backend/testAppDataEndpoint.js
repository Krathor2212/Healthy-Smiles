#!/usr/bin/env node

/**
 * Test Backend /api/app-data Endpoint
 * 
 * This script tests if the backend is returning real doctors or fake doctors.
 * Run this to verify the backend changes are working.
 */

const http = require('http');

// Configuration
const BACKEND_URL = 'http://10.10.112.140:4000';
const TEST_TOKEN = process.argv[2]; // Pass token as argument

if (!TEST_TOKEN) {
  console.log('\n❌ Error: No authentication token provided');
  console.log('\n📖 Usage:');
  console.log('   node testAppDataEndpoint.js YOUR_JWT_TOKEN');
  console.log('\n💡 Tip: Get your token from:');
  console.log('   1. Login to the mobile app');
  console.log('   2. Check AsyncStorage or network request headers');
  console.log('   3. Copy the JWT token\n');
  process.exit(1);
}

console.log('🧪 Testing /api/app-data endpoint...\n');
console.log(`🔗 Backend URL: ${BACKEND_URL}`);
console.log(`🔑 Using token: ${TEST_TOKEN.substring(0, 20)}...\n`);

const options = {
  hostname: '10.10.112.140',
  port: 4000,
  path: '/api/app-data',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`📡 Response Status: ${res.statusCode}\n`);

    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        
        console.log('✅ SUCCESS! Backend is responding.\n');
        console.log('📊 Response Summary:');
        console.log(`   Doctors: ${response.doctors?.length || 0}`);
        console.log(`   Medicines: ${response.medicines?.length || 0}`);
        console.log(`   Hospitals: ${response.hospitals?.length || 0}`);
        console.log(`   Articles (Trending): ${response.articles?.trending?.length || 0}`);
        console.log(`   Articles (Latest): ${response.articles?.latest?.length || 0}\n`);

        if (response.doctors && response.doctors.length > 0) {
          console.log('👨‍⚕️ Doctors Found:\n');
          response.doctors.forEach((doc, index) => {
            console.log(`   ${index + 1}. ${doc.name}`);
            console.log(`      Specialty: ${doc.specialty}`);
            console.log(`      Hospital: ${doc.hospital}`);
            console.log(`      Experience: ${doc.experience}`);
            console.log(`      Profile Photo: ${doc.image ? 'Yes' : 'No'}`);
            console.log(`      Assigned Hospitals: ${doc.assignedHospitals?.length || 0}\n`);
          });

          // Check if these are REAL doctors or FAKE doctors
          const doctorNames = response.doctors.map(d => d.name);
          const fakeNames = ['Dr. Michael Chen', 'Dr. Sarah Johnson', 'Dr. Lisa Anderson', 'Dr. Emily White'];
          const hasFakeDoctors = fakeNames.some(fake => doctorNames.includes(fake));

          if (hasFakeDoctors) {
            console.log('⚠️  WARNING: Backend is still returning FAKE DOCTORS!');
            console.log('   The backend may be using the old doctors_data table.\n');
          } else {
            console.log('✅ VERIFIED: Backend is returning REAL DOCTORS!');
            console.log('   Mobile app should show these doctors after cache is cleared.\n');
          }
        } else {
          console.log('⚠️  No doctors found in response.');
          console.log('   This could mean:');
          console.log('   1. No doctors exist in the database');
          console.log('   2. John Smith has role != "doctor"');
          console.log('   3. Database connection issue\n');
        }

        // Show doctor categories
        if (response.categories?.doctors) {
          console.log('🏷️  Doctor Categories:');
          response.categories.doctors.forEach(cat => {
            console.log(`   - ${cat.name}: ${cat.count} doctors`);
          });
          console.log('');
        }

      } catch (err) {
        console.error('❌ Error parsing response:', err.message);
        console.log('\n📄 Raw response:', data.substring(0, 200));
      }
    } else if (res.statusCode === 401) {
      console.log('❌ AUTHENTICATION FAILED');
      console.log('   Your token is invalid or expired.');
      console.log('   Please login again and get a fresh token.\n');
    } else {
      console.log('❌ REQUEST FAILED');
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Response: ${data}\n`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection Error:', error.message);
  console.log('\n🔍 Troubleshooting:');
  console.log('   1. Is the backend server running?');
  console.log('   2. Is it running on port 4000?');
  console.log('   3. Can you access http://10.10.112.140:4000 from this machine?\n');
});

req.end();
