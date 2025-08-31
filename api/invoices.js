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
        const { customerId, invoiceNumber, invoiceDate, dueDate, taxRate, items, notes, status } = req.body;
        
        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        
        const newInvoice = await prisma.invoice.create({
          data: {
            customerId,
            invoiceNumber,
            invoiceDate: new Date(invoiceDate),
            dueDate: new Date(dueDate),
            subtotal,
            taxRate,
            taxAmount,
            total,
            notes,
            status: status || 'DRAFT',
            items: {
              create: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
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
    return res.status(500).json({ error: 'Internal server error' });
  }
};
