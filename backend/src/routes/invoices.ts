import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import pdfService from '../services/pdfService';

const router = Router();

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  total: z.coerce.number().min(0)
});

const invoiceSchema = z.object({
  customerId: z.string(),
  date: z.string(),
  dueDate: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE']).default('DRAFT'),
  totalNet: z.coerce.number().min(0),
  totalTax: z.coerce.number().min(0),
  totalGross: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema)
});

// Get all invoices
router.get('/', auth, async (req: AuthRequest, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            company: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        items: true
      }
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

// Get invoice defaults (settings for new invoice)
router.get('/defaults', auth, async (req: AuthRequest, res, next) => {
  try {
    const settings = await prisma.companySettings.findUnique({
      where: { id: 'company' }
    });

    const defaults = {
      taxRate: settings?.defaultTaxRate || 19,
      paymentDue: settings?.defaultPaymentDue || 14,
      currency: settings?.currency || 'EUR',
      invoicePrefix: settings?.invoicePrefix || 'R'
    };

    res.json(defaults);
  } catch (error) {
    next(error);
  }
});

// Get invoice by ID
router.get('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// Create invoice
router.post('/', auth, async (req: AuthRequest, res, next) => {
  try {
    const data = invoiceSchema.parse(req.body);

    // Get company settings for invoice generation
    const settings = await prisma.companySettings.findUnique({
      where: { id: 'company' }
    });

    // Generate invoice number based on settings
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { invoiceNumber: 'desc' }
    });

    const baseNumber = settings?.invoiceStartNum || 1;
    const invoiceNumber = lastInvoice 
      ? Math.max(lastInvoice.invoiceNumber + 1, baseNumber)
      : baseNumber;

    // Calculate due date based on settings if not provided
    let dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (!dueDate && settings?.defaultPaymentDue) {
      dueDate = new Date(data.date);
      dueDate.setDate(dueDate.getDate() + settings.defaultPaymentDue);
    }

    // Use default tax rate from settings if not provided
    const taxRate = data.taxRate || settings?.defaultTaxRate || 19;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: data.customerId,
        date: new Date(data.date),
        dueDate: dueDate,
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

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

// Update invoice
router.put('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const data = invoiceSchema.parse(req.body);

    // Delete existing items and create new ones
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id }
    });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        customerId: data.customerId,
        date: new Date(data.date),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
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

    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// Delete invoice
router.delete('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.invoice.delete({
      where: { id }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Download invoice as PDF
router.get('/:id/pdf', auth, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Get invoice with customer and items
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
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
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber.toString(),
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : new Date().toISOString(),
      status: invoice.status,
      totalNet: Number(invoice.totalNet),
      totalTax: Number(invoice.totalTax),
      totalGross: Number(invoice.totalGross),
      taxRate: Number(invoice.taxRate),
      notes: invoice.notes || undefined,
      customer: {
        customerNumber: invoice.customer.customerNumber,
        company: (invoice.customer as any).company,
        firstName: (invoice.customer as any).firstName,
        lastName: (invoice.customer as any).lastName,
        email: invoice.customer.email || undefined,
        phone: invoice.customer.phone || undefined,
        address: invoice.customer.address,
        city: (invoice.customer as any).city,
        postalCode: (invoice.customer as any).postalCode,
        country: (invoice.customer as any).country
      },
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    };

    // Transform settings for PDF generation
    const pdfSettings = {
      id: settings.id,
      name: settings.name,
      address: settings.address,
      email: settings.email,
      phone: settings.phone,
      taxNumber: settings.taxNumber,
      vatId: settings.vatId,
      bankAccount: settings.bankAccount,
      bankName: settings.bankName,
      iban: settings.iban,
      bic: settings.bic,
      logo: settings.logo,
      website: settings.website,
      owner: settings.owner,
      defaultTaxRate: Number(settings.defaultTaxRate),
      defaultPaymentDue: settings.defaultPaymentDue,
      isSmallBusiness: settings.isSmallBusiness,
      currency: settings.currency,
      invoicePrefix: settings.invoicePrefix,
      quotePrefix: settings.quotePrefix,
      invoiceStartNum: settings.invoiceStartNum,
      quoteStartNum: settings.quoteStartNum,
      invoiceFooter: settings.invoiceFooter,
      quoteFooter: settings.quoteFooter,
      termsAndConditions: settings.termsAndConditions
    };

    // Generate PDF with Puppeteer
    const pdfDocumentData = {
      type: 'invoice' as const,
      number: invoice.invoiceNumber.toString(),
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
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
    res.setHeader('Content-Disposition', `attachment; filename="Rechnung_${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    next(error);
  }
});

export default router;
