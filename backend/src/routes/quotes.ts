import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import pdfService from '../services/pdfService';

const router = Router();

const quoteItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  total: z.coerce.number().min(0)
});

const quoteSchema = z.object({
  customerId: z.string(),
  date: z.string(),
  validUntil: z.string(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED']).default('DRAFT'),
  totalNet: z.coerce.number().min(0),
  totalTax: z.coerce.number().min(0),
  totalGross: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema)
});

// Get all quotes
router.get('/', auth, async (req: AuthRequest, res, next) => {
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: true
      }
    });
    res.json(quotes);
  } catch (error) {
    next(error);
  }
});

// Get quote defaults (settings for new quote)
router.get('/defaults', auth, async (req: AuthRequest, res, next) => {
  try {
    const settings = await prisma.companySettings.findUnique({
      where: { id: 'company' }
    });

    const defaults = {
      taxRate: settings?.defaultTaxRate || 19,
      currency: settings?.currency || 'EUR',
      quotePrefix: settings?.quotePrefix || 'A',
      // Default validity: 30 days from today
      validityDays: 30
    };

    res.json(defaults);
  } catch (error) {
    next(error);
  }
});

// Get quote by ID
router.get('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json(quote);
  } catch (error) {
    next(error);
  }
});

// Create quote
router.post('/', auth, async (req: AuthRequest, res, next) => {
  try {
    const data = quoteSchema.parse(req.body);

    // Get company settings for quote generation
    const settings = await prisma.companySettings.findUnique({
      where: { id: 'company' }
    });

    // Generate quote number based on settings
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { quoteNumber: 'desc' }
    });

    const baseNumber = settings?.quoteStartNum || 1;
    const quoteNumber = lastQuote 
      ? Math.max(lastQuote.quoteNumber + 1, baseNumber)
      : baseNumber;

    // Use default tax rate from settings if not provided
    const taxRate = data.taxRate || settings?.defaultTaxRate || 19;

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        customerId: data.customerId,
        date: new Date(data.date),
        validUntil: new Date(data.validUntil),
        status: data.status,
        totalNet: data.totalNet,
        totalTax: data.totalTax,
        totalGross: data.totalGross,
        taxRate: taxRate,
        notes: data.notes,
        items: {
          create: data.items
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    res.status(201).json(quote);
  } catch (error) {
    next(error);
  }
});

// Update quote
router.put('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const data = quoteSchema.parse(req.body);

    // Delete existing items and create new ones
    await prisma.quoteItem.deleteMany({
      where: { quoteId: id }
    });

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        customerId: data.customerId,
        date: new Date(data.date),
        validUntil: new Date(data.validUntil),
        status: data.status,
        totalNet: data.totalNet,
        totalTax: data.totalTax,
        totalGross: data.totalGross,
        taxRate: data.taxRate,
        notes: data.notes,
        items: {
          create: data.items
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    res.json(quote);
  } catch (error) {
    next(error);
  }
});

// Delete quote
router.delete('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.quote.delete({
      where: { id }
    });

    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Download quote as PDF
router.get('/:id/pdf', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Get quote with customer and items
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    });

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Get company settings
    const settings = await prisma.companySettings.findUnique({
      where: { id: 'company' }
    });

    if (!settings) {
      return res.status(500).json({ message: 'Company settings not found' });
    }

    // Transform data for PDF generation
    const pdfData = {
      id: quote.id,
      quoteNumber: quote.quoteNumber.toString(),
      date: quote.date.toISOString(),
      validUntil: quote.validUntil ? quote.validUntil.toISOString() : new Date().toISOString(),
      status: quote.status,
      totalNet: Number(quote.totalNet),
      totalTax: Number(quote.totalTax),
      totalGross: Number(quote.totalGross),
      taxRate: Number(quote.taxRate),
      notes: quote.notes || undefined,
      customer: {
        customerNumber: quote.customer.customerNumber,
        company: (quote.customer as any).company,
        firstName: (quote.customer as any).firstName,
        lastName: (quote.customer as any).lastName,
        email: quote.customer.email || undefined,
        phone: quote.customer.phone || undefined,
        address: quote.customer.address,
        city: (quote.customer as any).city,
        postalCode: (quote.customer as any).postalCode,
        country: (quote.customer as any).country
      },
      items: quote.items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    };

    // Transform settings for PDF generation (with type assertion for now)
    const pdfSettings = {
      id: settings.id,
      name: settings.name,
      address: settings.address,
      email: settings.email,
      phone: settings.phone,
      taxNumber: settings.taxNumber,
      vatId: (settings as any).vatId,
      bankAccount: settings.bankAccount,
      bankName: (settings as any).bankName,
      iban: (settings as any).iban,
      bic: (settings as any).bic,
      logo: settings.logo,
      website: (settings as any).website,
      owner: (settings as any).owner,
      defaultTaxRate: Number((settings as any).defaultTaxRate || 19),
      defaultPaymentDue: (settings as any).defaultPaymentDue || 14,
      isSmallBusiness: (settings as any).isSmallBusiness || false,
      currency: (settings as any).currency || 'EUR',
      invoicePrefix: (settings as any).invoicePrefix || 'R',
      quotePrefix: (settings as any).quotePrefix || 'A',
      invoiceStartNum: (settings as any).invoiceStartNum || 1,
      quoteStartNum: (settings as any).quoteStartNum || 1,
      invoiceFooter: (settings as any).invoiceFooter,
      quoteFooter: (settings as any).quoteFooter,
      termsAndConditions: (settings as any).termsAndConditions
    };

    // Generate PDF with Puppeteer
    const pdfDocumentData = {
      type: 'quote' as const,
      number: quote.quoteNumber.toString(),
      date: quote.date.toISOString(),
      dueDate: undefined, // Quotes don't have due dates
      customer: {
        name: pdfData.customer.company || `${pdfData.customer.firstName} ${pdfData.customer.lastName}`,
        email: pdfData.customer.email || undefined,
        address: pdfData.customer.address || undefined,
        city: pdfData.customer.city || undefined,
        postalCode: pdfData.customer.postalCode || undefined,
        phone: pdfData.customer.phone || undefined,
      },
      items: pdfData.items,
      subtotal: pdfData.totalNet,
      tax: pdfData.totalTax,
      total: pdfData.totalGross,
      status: pdfData.status,
      notes: pdfData.notes || undefined,
      companySettings: {
        companyName: pdfSettings.name,
        address: pdfSettings.address || undefined,
        city: undefined, // Wir haben keine separate Stadt in den Settings
        postalCode: undefined, // Wir haben keine separate PLZ in den Settings
        phone: pdfSettings.phone || undefined,
        email: pdfSettings.email || undefined,
        website: pdfSettings.website || undefined,
        taxNumber: pdfSettings.taxNumber || undefined,
        vatNumber: pdfSettings.vatId || undefined,
        logoUrl: pdfSettings.logo ? `uploads/${pdfSettings.logo}` : undefined,
      }
    };

    const pdfBuffer = await pdfService.generatePDF(pdfDocumentData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Angebot_${quote.quoteNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    next(error);
  }
});

export default router;
