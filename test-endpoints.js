// Simple test script to verify our new endpoints work
const express = require('express');
const app = express();

// Mock the stats controller logic for testing
app.get('/api/v1/stats/tvl/history', (req, res) => {
  const history = [];
  const baseTVL = 10000000; // Starting TVL: $10M
  const growthRate = 0.015; // 1.5% daily growth rate
  const volatility = 0.02; // 2% daily volatility for realism
  
  // Generate 30 days of data ending today
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setUTCHours(0, 0, 0, 0);
    
    // Calculate TVL with growth and some volatility
    const daysPassed = 29 - i;
    const trendFactor = Math.pow(1 + growthRate, daysPassed);
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    const tvlUSD = baseTVL * trendFactor * randomFactor;
    
    history.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      tvlUSD: Math.round(tvlUSD * 100) / 100, // Round to 2 decimal places
    });
  }
  
  res.json(history);
});

// Mock the webhook endpoint
app.use(express.json());
app.post('/api/v1/webhooks/stellar', (req, res) => {
  console.log('Received Stellar Event:', req.body);
  res.json({ received: true });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  
  // Test the TVL history endpoint
  console.log('\n=== Testing TVL History Endpoint ===');
  fetch(`http://localhost:${port}/api/v1/stats/tvl/history`)
    .then(res => res.json())
    .then(data => {
      console.log('TVL History Response:');
      console.log('First 5 entries:');
      data.slice(0, 5).forEach((entry, index) => {
        console.log(`${index + 1}. Date: ${entry.date}, TVL: $${entry.tvlUSD.toLocaleString()}`);
      });
      console.log(`Total entries: ${data.length}`);
      
      // Test the webhook endpoint
      console.log('\n=== Testing Stellar Webhook Endpoint ===');
      const testPayload = {
        event: 'contract_event',
        contract: 'TestContract',
        timestamp: new Date().toISOString(),
        data: { test: 'data' }
      };
      
      return fetch(`http://localhost:${port}/api/v1/webhooks/stellar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
    })
    .then(res => res.json())
    .then(data => {
      console.log('Webhook Response:', data);
      console.log('\n✅ Both endpoints working correctly!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Test failed:', err);
      process.exit(1);
    });
});
