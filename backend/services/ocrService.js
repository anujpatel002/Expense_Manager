const Tesseract = require('tesseract.js');

const extractReceiptData = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    
    // Extract amount using comprehensive regex patterns
    const amountPatterns = [
      /total[:\s]*[\$€£¥₹]?([\d,]+\.?\d*)/i,
      /amount[:\s]*[\$€£¥₹]?([\d,]+\.?\d*)/i,
      /grand[\s]*total[:\s]*[\$€£¥₹]?([\d,]+\.?\d*)/i,
      /final[\s]*total[:\s]*[\$€£¥₹]?([\d,]+\.?\d*)/i,
      /balance[:\s]*[\$€£¥₹]?([\d,]+\.?\d*)/i,
      /[\$€£¥₹]([\d,]+\.\d{2})/g,
      /([\d,]+\.\d{2})[\s]*[\$€£¥₹]/g,
      /total[\s]*due[:\s]*[\$€£¥₹]?([\d,]+\.?\d*)/i
    ];
    
    let amount = null;
    const amounts = [];
    
    for (const pattern of amountPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const cleanAmount = (match[1] || match[0])
          .replace(/[\$€£¥₹,]/g, '')
          .replace(/[^\d.]/g, '');
        const numAmount = parseFloat(cleanAmount);
        if (!isNaN(numAmount) && numAmount > 0) {
          amounts.push(numAmount);
        }
      }
    }
    
    // Use the largest amount found (likely the total)
    if (amounts.length > 0) {
      amount = Math.max(...amounts);
    }

    // Extract date using comprehensive regex patterns
    const datePatterns = [
      /date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /date[:\s]*(\d{1,2}-\d{1,2}-\d{2,4})/i,
      /date[:\s]*(\d{4}-\d{1,2}-\d{1,2})/i,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{1,2}-\d{1,2}-\d{4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/,
      /(\d{1,2}\.\d{1,2}\.\d{4})/,
      /([A-Za-z]{3}\s+\d{1,2},?\s+\d{4})/,
      /(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/
    ];
    
    let date = null;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const rawDate = match[1];
        // Convert to YYYY-MM-DD format with better parsing
        try {
          let parsedDate;
          
          // Handle different date formats
          if (rawDate.includes('/')) {
            const parts = rawDate.split('/');
            if (parts.length === 3) {
              // Assume MM/DD/YYYY or DD/MM/YYYY format
              const month = parseInt(parts[0]);
              const day = parseInt(parts[1]);
              const year = parseInt(parts[2]);
              
              // If year is 2-digit, assume 20xx
              const fullYear = year < 100 ? 2000 + year : year;
              
              parsedDate = new Date(fullYear, month - 1, day);
            }
          } else if (rawDate.includes('-')) {
            parsedDate = new Date(rawDate);
          } else if (rawDate.includes('.')) {
            const parts = rawDate.split('.');
            if (parts.length === 3) {
              parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          } else {
            parsedDate = new Date(rawDate);
          }
          
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
          }
        } catch (error) {
          console.error('Date parsing error:', error);
        }
        break;
      }
    }

    // Extract vendor name with improved logic
    const lines = text.split('\n').filter(line => line.trim());
    let vendor = null;
    const skipWords = ['receipt', 'total', 'amount', 'tax', 'subtotal', 'date', 'time', 'thank', 'visit', 'phone', 'address', 'www', 'http'];
    const skipPatterns = [/^\d+$/, /^[\d\s\-\(\)]+$/, /^\$/, /^\d{1,2}[\/\-]\d{1,2}/, /^\d{1,2}:\d{2}/];
    
    for (const line of lines) {
      const cleanLine = line.trim();
      const lowerLine = cleanLine.toLowerCase();
      
      if (cleanLine.length > 2 && cleanLine.length < 50 &&
          !skipWords.some(word => lowerLine.includes(word)) &&
          !skipPatterns.some(pattern => pattern.test(cleanLine)) &&
          /[a-zA-Z]/.test(cleanLine)) {
        vendor = cleanLine;
        break;
      }
    }

    // Extract category based on receipt content with expanded keywords
    const categoryKeywords = {
      'Meals': ['coffee', 'sandwich', 'cookie', 'food', 'restaurant', 'cafe', 'lunch', 'dinner', 'breakfast', 'meal', 'pizza', 'burger', 'drink', 'tea', 'juice', 'water', 'soda', 'beer', 'wine', 'bar', 'bistro', 'deli', 'bakery', 'donut', 'bagel', 'salad', 'soup'],
      'Travel': ['hotel', 'flight', 'taxi', 'uber', 'lyft', 'gas', 'fuel', 'parking', 'airline', 'airport', 'train', 'bus', 'metro', 'subway', 'rental', 'car', 'toll', 'highway', 'motel', 'inn', 'lodge'],
      'Office Supplies': ['office', 'supplies', 'paper', 'pen', 'stapler', 'printer', 'ink', 'stationery', 'depot', 'staples', 'folder', 'notebook', 'pencil', 'marker', 'tape', 'clips'],
      'Software': ['software', 'license', 'subscription', 'saas', 'app', 'microsoft', 'adobe', 'google', 'apple', 'amazon', 'digital', 'cloud', 'online', 'web', 'tech'],
      'Marketing': ['marketing', 'advertising', 'promotion', 'campaign', 'social media', 'facebook', 'google ads', 'print', 'design', 'branding', 'flyer', 'banner', 'sign']
    };
    
    let category = null;
    const textLower = text.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        category = cat;
        break;
      }
    }

    return {
      amount,
      date,
      vendor,
      category,
      rawText: text
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process receipt image');
  }
};

module.exports = {
  extractReceiptData
};