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
        const customers = await prisma.customer.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json(customers);
        
      case 'POST':
        const { company, firstName, lastName, email, phone, address } = req.body;
        
        const newCustomer = await prisma.customer.create({
          data: {
            company,
            firstName,
            lastName,
            email,
            phone,
            address
          }
        });
        
        return res.status(201).json(newCustomer);
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Customer API error:', error);
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
