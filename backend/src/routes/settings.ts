import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import { auth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Multer configuration for logo uploads
const storage = multer.diskStorage({
  destination: async (req: Request, file: Express.Multer.File, cb: Function) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Validation schema for complete company settings - SUPER SIMPLE, ALLOWS NULL
const settingsSchema = z.object({
  name: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  vatId: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  iban: z.string().optional().nullable(),
  bic: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  owner: z.string().optional().nullable(),
  
  // Business settings
  defaultTaxRate: z.union([z.string(), z.number()]).transform(val => Number(val) || 19.00),
  defaultPaymentDue: z.union([z.string(), z.number()]).transform(val => Number(val) || 14),
  isSmallBusiness: z.boolean().optional().nullable(),
  currency: z.string().optional().nullable(),
  
  // Document settings
  invoicePrefix: z.string().optional().nullable(),
  quotePrefix: z.string().optional().nullable(),
  invoiceStartNum: z.union([z.string(), z.number()]).transform(val => Number(val) || 1),
  quoteStartNum: z.union([z.string(), z.number()]).transform(val => Number(val) || 1),
  
  // Default texts
  invoiceFooter: z.string().optional().nullable(),
  quoteFooter: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable()
}).partial();

// GET /api/settings - Get company settings
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const settings = await prisma.companySettings.findFirst();
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        name: '',
        address: '',
        email: '',
        phone: '',
        taxNumber: '',
        vatId: '',
        bankAccount: '',
        bankName: '',
        iban: '',
        bic: '',
        logo: '',
        website: '',
        owner: '',
        defaultTaxRate: 19.00,
        defaultPaymentDue: 14,
        isSmallBusiness: false,
        currency: 'EUR',
        invoicePrefix: 'R',
        quotePrefix: 'A',
        invoiceStartNum: 1,
        quoteStartNum: 1,
        invoiceFooter: '',
        quoteFooter: '',
        termsAndConditions: ''
      };
      return res.json(defaultSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Einstellungen' });
  }
});

// PUT /api/settings - Update company settings
router.put('/', auth, async (req: Request, res: Response) => {
  try {
    console.log('Settings update request received:', JSON.stringify(req.body, null, 2));
    
    // Remove non-schema fields before validation
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...bodyWithoutTimestamps } = req.body;
    
    console.log('Body without timestamps:', JSON.stringify(bodyWithoutTimestamps, null, 2));
    
    let validatedData;
    try {
      validatedData = settingsSchema.parse(bodyWithoutTimestamps);
      console.log('Validation successful, processed data:', JSON.stringify(validatedData, null, 2));
    } catch (zodError) {
      console.error('Zod parsing failed:', zodError);
      if (zodError instanceof z.ZodError) {
        console.error('Zod error details:', zodError.errors);
        return res.status(400).json({ 
          error: 'Validierungsfehler',
          details: zodError.errors 
        });
      }
      throw zodError;
    }

    // Simple data processing - just take what we get
    const dataToSave = {
      name: validatedData.name || '',
      address: validatedData.address || '',
      email: validatedData.email || '',
      phone: validatedData.phone || '',
      taxNumber: validatedData.taxNumber || null,
      vatId: validatedData.vatId || null,
      bankAccount: validatedData.bankAccount || null,
      bankName: validatedData.bankName || null,
      iban: validatedData.iban || null,
      bic: validatedData.bic || null,
      logo: validatedData.logo || null,
      website: validatedData.website || null,
      owner: validatedData.owner || null,
      defaultTaxRate: validatedData.defaultTaxRate || 19.00,
      defaultPaymentDue: validatedData.defaultPaymentDue || 14,
      isSmallBusiness: validatedData.isSmallBusiness || false,
      currency: validatedData.currency || 'EUR',
      invoicePrefix: validatedData.invoicePrefix || 'R',
      quotePrefix: validatedData.quotePrefix || 'A',
      invoiceStartNum: validatedData.invoiceStartNum || 1,
      quoteStartNum: validatedData.quoteStartNum || 1,
      invoiceFooter: validatedData.invoiceFooter || null,
      quoteFooter: validatedData.quoteFooter || null,
      termsAndConditions: validatedData.termsAndConditions || null
    };

    // Check if settings already exist
    const existingSettings = await prisma.companySettings.findFirst();

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: dataToSave
      });
    } else {
      // Create new settings with fixed ID
      settings = await prisma.companySettings.create({
        data: {
          id: 'company',
          ...dataToSave
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error in settings update:', error);
    if (error instanceof z.ZodError) {
      console.error('Zod validation error details:', error.errors);
      return res.status(400).json({ 
        error: 'Validierungsfehler',
        details: error.errors 
      });
    }
    console.error('General error updating settings:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Einstellungen' });
  }
});

// POST /api/settings/logo - Upload company logo
router.post('/logo', auth, upload.single('logo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    // Delete old logo if it exists
    const existingSettings = await prisma.companySettings.findFirst();
    if (existingSettings?.logo) {
      try {
        const oldLogoPath = path.join(process.cwd(), 'uploads', existingSettings.logo);
        await fs.unlink(oldLogoPath);
      } catch (error) {
        console.error('Error deleting old logo:', error);
        // Continue even if old logo deletion fails
      }
    }

    // Update settings with new logo path
    if (existingSettings) {
      await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: { logo: req.file.filename }
      });
    } else {
      await prisma.companySettings.create({
        data: {
          id: 'company',
          name: '',
          address: '',
          email: '',
          phone: '',
          logo: req.file.filename
        }
      });
    }

    res.json({ 
      message: 'Logo erfolgreich hochgeladen',
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Fehler beim Upload des Logos' });
  }
});

// DELETE /api/settings/logo/:filename - Delete company logo
router.delete('/logo/:filename', auth, async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    // Delete file from filesystem
    const logoPath = path.join(process.cwd(), 'uploads', filename);
    try {
      await fs.unlink(logoPath);
    } catch (error) {
      console.error('Error deleting logo file:', error);
      // Continue even if file deletion fails
    }

    // Update settings to remove logo path
    const existingSettings = await prisma.companySettings.findFirst();
    if (existingSettings) {
      await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: { logo: null }
      });
    }

    res.json({ message: 'Logo erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Logos' });
  }
});

export default router;
