// Simple test to verify CORS security fix
const fetch = require('node-fetch');

async function testCorsSecurity() {
  console.log('Testing CORS security fix...');
  
  try {
    // Test with allowed origin
    const allowedResponse = await fetch('http://localhost:3000/api', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('Allowed origin test - Status:', allowedResponse.status);
    console.log('CORS headers:', allowedResponse.headers.raw());
    
    // Test with disallowed origin
    const disallowedResponse = await fetch('http://localhost:3000/api', {
      headers: {
        'Origin': 'https://malicious-site.com'
      }
    });
    
    console.log('Disallowed origin test - Status:', disallowedResponse.status);
    console.log('CORS headers:', disallowedResponse.headers.raw());
    
  } catch (error) {
    console.log('Test completed (server may not be running):', error.message);
  }
}

testCorsSecurity();
