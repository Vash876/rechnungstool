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
        // Try to get existing settings or return defaults
        let settings = await prisma.settings.findFirst();
        
        if (!settings) {
          // Create default settings if none exist
          settings = await prisma.settings.create({
            data: {
              companyName: 'Mein Handwerksbetrieb',
              companyAddress: 'Musterstraße 1\n12345 Musterstadt',
              companyPhone: '+49 123 456789',
              companyEmail: 'info@handwerksbetrieb.de',
              taxNumber: 'DE123456789',
              vatId: '',
              bankAccount: 'IBAN: DE12 3456 7890 1234 5678 90\nBIC: GENODEF1ABC',
              defaultTaxRate: 19,
              invoicePrefix: 'R-',
              quotePrefix: 'A-',
              paymentTerms: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
              logoPath: null
            }
          });
        }
        
        return res.status(200).json(settings);
        
      case 'PUT':
        const updateData = req.body;
        
        const updatedSettings = await prisma.settings.upsert({
          where: { id: 1 }, // Assuming single settings record
          update: updateData,
          create: {
            id: 1,
            ...updateData
          }
        });
        
        return res.status(200).json(updatedSettings);
        
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
