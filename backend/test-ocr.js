const { extractReceiptData } = require('./services/ocrService');
const path = require('path');

async function testOCR() {
  try {
    console.log('Testing OCR functionality...');
    
    // Test with an existing receipt file
    const receiptPath = path.join(__dirname, 'uploads', 'receipts');
    const fs = require('fs');
    
    if (fs.existsSync(receiptPath)) {
      const files = fs.readdirSync(receiptPath);
      if (files.length > 0) {
        const testFile = path.join(receiptPath, files[0]);
        console.log(`Testing with file: ${testFile}`);
        
        const result = await extractReceiptData(testFile);
        console.log('OCR Result:', JSON.stringify(result, null, 2));
      } else {
        console.log('No receipt files found for testing');
      }
    } else {
      console.log('Receipts directory not found');
    }
  } catch (error) {
    console.error('OCR Test Error:', error);
  }
}

testOCR();