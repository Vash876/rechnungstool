const prisma = require('./lib/prisma');
const { verifyToken } = require('./lib/auth');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { method } = req;
    
    switch (method) {
      case 'GET':
        const quotes = await prisma.quote.findMany({
          include: {
            customer: true,
            items: true
          },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(quotes);
        
      case 'POST':
        const { customerId, quoteDate, validUntil, taxRate, items, notes, status } = req.body;
        
        // Validate required fields
        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: 'Missing required fields: customerId, items' });
        }
        
        // Validate and parse dates
        const parsedQuoteDate = quoteDate ? new Date(quoteDate) : new Date();
        const parsedValidUntil = validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        
        if (isNaN(parsedQuoteDate.getTime()) || isNaN(parsedValidUntil.getTime())) {
          return res.status(400).json({ error: 'Invalid date format' });
        }
        
        // Validate and calculate totals
        let subtotal = 0;
        const validatedItems = [];
        
        for (const item of items) {
          const quantity = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          
          if (!item.description || quantity <= 0 || price < 0) {
            return res.status(400).json({ error: 'Invalid item data' });
          }
          
          const itemTotal = quantity * price;
          subtotal += itemTotal;
          
          validatedItems.push({
            description: item.description,
            quantity,
            price,
            total: itemTotal
          });
        }
        
        const validatedTaxRate = parseFloat(taxRate) || 19;
        const taxAmount = subtotal * (validatedTaxRate / 100);
        const total = subtotal + taxAmount;
        
        // Generate quote number
        const quoteCount = await prisma.quote.count();
        const quoteNumber = `AG${String(quoteCount + 1).padStart(4, '0')}`;
        
        const newQuote = await prisma.quote.create({
          data: {
            customerId,
            quoteNumber,
            quoteDate: parsedQuoteDate,
            validUntil: parsedValidUntil,
            subtotal,
            taxRate: validatedTaxRate,
            taxAmount,
            total,
            notes: notes || '',
            status: status || 'DRAFT',
            items: {
              create: validatedItems
            }
          },
          include: {
            customer: true,
            items: true
          }
        });
        
        return res.status(201).json(newQuote);
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Quote API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
