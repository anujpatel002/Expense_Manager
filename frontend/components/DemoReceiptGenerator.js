import { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useAuth } from '../context/AuthContext';
import { useExchangeRates } from '../hooks/useCurrency';
import { Download, Receipt, Shuffle } from 'lucide-react';

const DemoReceiptGenerator = ({ onReceiptGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const defaultCurrency = user?.company?.defaultCurrency || 'USD';
  const { rates } = useExchangeRates('USD'); // Base rates from USD
  
  // Receipt templates based on categories
  const receiptTemplates = {
    'Travel': {
      stores: ['Airport Taxi Service', 'City Hotel', 'Metro Transit', 'Uber Ride'],
      items: [
        { name: 'Airport Transfer', price: [25, 45] },
        { name: 'Hotel Room (1 night)', price: [89, 150] },
        { name: 'Metro Card', price: [15, 25] },
        { name: 'Taxi Fare', price: [12, 30] }
      ]
    },
    'Meals': {
      stores: ['Downtown Bistro', 'Coffee Corner', 'Business Lunch', 'Quick Bite'],
      items: [
        { name: 'Business Lunch', price: [18, 35] },
        { name: 'Coffee & Pastry', price: [8, 15] },
        { name: 'Team Dinner', price: [45, 80] },
        { name: 'Client Meeting Meal', price: [25, 50] }
      ]
    },
    'Office Supplies': {
      stores: ['Office Depot', 'Staples', 'Business Supply Co', 'Print Shop'],
      items: [
        { name: 'Printer Paper (5 reams)', price: [25, 40] },
        { name: 'Ink Cartridges', price: [35, 60] },
        { name: 'Office Chairs', price: [120, 200] },
        { name: 'Notebooks & Pens', price: [15, 25] }
      ]
    },
    'Software': {
      stores: ['Microsoft Store', 'Adobe Systems', 'Software Vendor', 'Tech Solutions'],
      items: [
        { name: 'Office 365 License', price: [99, 149] },
        { name: 'Adobe Creative Suite', price: [239, 299] },
        { name: 'Project Management Tool', price: [49, 89] },
        { name: 'Antivirus Software', price: [39, 69] }
      ]
    },
    'Marketing': {
      stores: ['Print Media Co', 'Digital Agency', 'Event Services', 'Ad Platform'],
      items: [
        { name: 'Business Cards (1000)', price: [45, 75] },
        { name: 'Trade Show Booth', price: [500, 800] },
        { name: 'Social Media Ads', price: [150, 300] },
        { name: 'Promotional Materials', price: [80, 150] }
      ]
    }
  };
  
  // Company size affects expense amounts
  const getCompanySizeMultiplier = () => {
    // Estimate company size based on user count (simplified)
    const random = Math.random();
    if (random < 0.3) return 0.7; // Small company
    if (random < 0.7) return 1.0; // Medium company  
    return 1.5; // Large company
  };
  
  // Convert USD to company currency
  const convertToCompanyCurrency = (usdAmount) => {
    if (defaultCurrency === 'USD' || !rates[defaultCurrency]) {
      return usdAmount;
    }
    return usdAmount * rates[defaultCurrency];
  };
  
  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥',
      'CAD': 'C$', 'AUD': 'A$', 'CNY': '¥', 'SGD': 'S$'
    };
    return symbols[currency] || currency;
  };

  const generateDemoReceipt = () => {
    setIsGenerating(true);
    
    // Select random category and template
    const categories = Object.keys(receiptTemplates);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const template = receiptTemplates[selectedCategory];
    
    // Select random store and items
    const store = template.stores[Math.floor(Math.random() * template.stores.length)];
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const selectedItems = [];
    
    const sizeMultiplier = getCompanySizeMultiplier();
    let subtotal = 0;
    
    for (let i = 0; i < numItems; i++) {
      const item = template.items[Math.floor(Math.random() * template.items.length)];
      const basePrice = item.price[0] + Math.random() * (item.price[1] - item.price[0]);
      const usdPrice = basePrice * sizeMultiplier;
      const finalPrice = convertToCompanyCurrency(usdPrice);
      selectedItems.push({ name: item.name, price: finalPrice });
      subtotal += finalPrice;
    }
    
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    const currencySymbol = getCurrencySymbol(defaultCurrency);
    
    // Create canvas for receipt generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Receipt content
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(store.toUpperCase(), canvas.width / 2, 50);
    
    ctx.font = '12px Arial';
    ctx.fillText('123 Business District', canvas.width / 2, 75);
    ctx.fillText('Corporate City, CC 12345', canvas.width / 2, 95);
    ctx.fillText('Tel: (555) 123-4567', canvas.width / 2, 115);
    
    // Line separator
    ctx.beginPath();
    ctx.moveTo(50, 140);
    ctx.lineTo(350, 140);
    ctx.stroke();
    
    // Date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    
    ctx.textAlign = 'left';
    ctx.font = '12px Arial';
    ctx.fillText(`Date: ${dateStr}`, 50, 170);
    ctx.fillText(`Time: ${timeStr}`, 50, 190);
    ctx.fillText(`Category: ${selectedCategory}`, 50, 210);
    
    // Items
    ctx.fillText('Items:', 50, 250);
    let yPos = 280;
    selectedItems.forEach((item, index) => {
      const priceStr = `$${item.price.toFixed(2)}`;
      const itemText = `${item.name}`;
      ctx.fillText(itemText, 50, yPos);
      ctx.textAlign = 'right';
      ctx.fillText(priceStr, 350, yPos);
      ctx.textAlign = 'left';
      yPos += 20;
    });
    
    // Line separator
    ctx.beginPath();
    ctx.moveTo(50, yPos + 10);
    ctx.lineTo(350, yPos + 10);
    ctx.stroke();
    
    // Totals
    yPos += 40;
    ctx.fillText('Subtotal:', 50, yPos);
    ctx.textAlign = 'right';
    ctx.fillText(`$${subtotal.toFixed(2)}`, 350, yPos);
    
    yPos += 20;
    ctx.textAlign = 'left';
    ctx.fillText('Tax (8%):', 50, yPos);
    ctx.textAlign = 'right';
    ctx.fillText(`$${tax.toFixed(2)}`, 350, yPos);
    
    yPos += 25;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('TOTAL:', 50, yPos);
    ctx.textAlign = 'right';
    ctx.fillText(`$${total.toFixed(2)}`, 350, yPos);
    
    // Payment info
    yPos += 40;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Payment: Credit Card', 50, yPos);
    ctx.fillText('Card: ****1234', 50, yPos + 20);
    
    // Footer
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for your business!', canvas.width / 2, yPos + 60);
    
    // Convert canvas to blob and pass category info
    canvas.toBlob((blob) => {
      const file = new File([blob], `demo-receipt-${selectedCategory.toLowerCase()}.png`, { type: 'image/png' });
      // Add metadata to file for auto-selection
      file.suggestedCategory = selectedCategory;
      file.extractedAmount = total;
      file.originalCurrency = 'USD'; // Mark as USD for conversion
      file.extractedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      setIsGenerating(false);
      onReceiptGenerated(file);
    }, 'image/png');
  };

  const downloadSampleReceipt = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 400;
    canvas.height = 600;
    
    // Generate the same receipt
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SAMPLE RECEIPT', canvas.width / 2, 50);
    
    ctx.font = '14px Arial';
    ctx.fillText('Demo Store Inc.', canvas.width / 2, 75);
    ctx.fillText('456 Sample Ave', canvas.width / 2, 95);
    ctx.fillText('Test City, TC 54321', canvas.width / 2, 115);
    
    ctx.beginPath();
    ctx.moveTo(50, 140);
    ctx.lineTo(350, 140);
    ctx.stroke();
    
    const now = new Date();
    ctx.textAlign = 'left';
    ctx.fillText(`Date: ${now.toLocaleDateString()}`, 50, 170);
    ctx.fillText(`Time: ${now.toLocaleTimeString()}`, 50, 190);
    
    ctx.fillText('Items:', 50, 230);
    ctx.fillText('1x Coffee               $4.50', 50, 260);
    ctx.fillText('1x Sandwich            $12.99', 50, 280);
    ctx.fillText('1x Cookie               $2.50', 50, 300);
    
    ctx.beginPath();
    ctx.moveTo(50, 320);
    ctx.lineTo(350, 320);
    ctx.stroke();
    
    ctx.fillText('Subtotal:              $19.99', 50, 350);
    ctx.fillText('Tax (7%):               $1.40', 50, 370);
    ctx.font = 'bold 16px Arial';
    ctx.fillText('TOTAL:                 $21.39', 50, 400);
    
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Thank you!', canvas.width / 2, 450);
    
    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample-receipt.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Receipt className="h-5 w-5 mr-2" />
          Demo Receipt Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Generate demo receipts to test the OCR functionality
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={generateDemoReceipt} 
            disabled={isGenerating}
            className="w-full"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Smart Receipt'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={downloadSampleReceipt}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Sample Receipt
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Smart receipts with random categories & amounts</p>
          <p>• Amounts scaled by company size</p>
          <p>• Auto-selects category based on receipt type</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoReceiptGenerator;