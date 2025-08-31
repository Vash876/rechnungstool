const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    // Hardcoded admin for testing
    if (email === 'admin@handwerk.de' && password === 'admin123') {
      const token = jwt.sign(
        { userId: 1, email: 'admin@handwerk.de' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      
      return res.status(200).json({
        token,
        user: { id: 1, email: 'admin@handwerk.de' }
      });
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
