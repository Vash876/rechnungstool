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
        const invoices = await prisma.invoice.findMany({
          include: {
            customer: true,
            items: true
          },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(invoices);
        
      case 'POST':
        const { customerId, date, dueDate, taxRate, items, notes, status, totalNet, totalTax, totalGross } = req.body;
        
        // Validate required fields
        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ error: 'Missing required fields: customerId, items' });
        }
        
        // Validate and parse dates
        const parsedInvoiceDate = date ? new Date(date) : new Date();
        const parsedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        
        if (isNaN(parsedInvoiceDate.getTime()) || isNaN(parsedDueDate.getTime())) {
          return res.status(400).json({ error: 'Invalid date format' });
        }
        
        // Validate and calculate totals
        let subtotal = 0;
        const validatedItems = [];
        
        for (const item of items) {
          const quantity = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.unitPrice || item.price) || 0;
          
          if (!item.description || quantity <= 0 || price < 0) {
            return res.status(400).json({ error: 'Invalid item data' });
          }
          
          const itemTotal = quantity * price;
          subtotal += itemTotal;
          
          validatedItems.push({
            description: item.description,
            quantity,
            unitPrice: price,
            total: itemTotal
          });
        }
        
        // Use frontend-calculated totals if provided, otherwise calculate
        const finalTotalNet = totalNet !== undefined ? parseFloat(totalNet) : subtotal;
        const validatedTaxRate = parseFloat(taxRate) || 19;
        const finalTotalTax = totalTax !== undefined ? parseFloat(totalTax) : finalTotalNet * (validatedTaxRate / 100);
        const finalTotalGross = totalGross !== undefined ? parseFloat(totalGross) : finalTotalNet + finalTotalTax;
        
        // Generate invoice number
        const invoiceCount = await prisma.invoice.count();
        const invoiceNumber = invoiceCount + 1;
        
        const newInvoice = await prisma.invoice.create({
          data: {
            customerId,
            invoiceNumber,
            date: parsedInvoiceDate,
            dueDate: parsedDueDate,
            totalNet: finalTotalNet,
            totalTax: finalTotalTax,
            totalGross: finalTotalGross,
            taxRate: validatedTaxRate,
            notes: notes || '',
            status: status || 'DRAFT',
            items: {
              create: validatedItems.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
              }))
            }
          },
          include: {
            customer: true,
            items: true
          }
        });
        
        return res.status(201).json(newInvoice);
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Invoice API error:', error);
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
