import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

const customerSchema = z.object({
  company: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional()
});

// Get all customers
router.get('/', auth, async (req: AuthRequest, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            invoices: true,
            quotes: true
          }
        }
      }
    });

    res.json(customers);
  } catch (error) {
    next(error);
  }
});

// Get customer by ID
router.get('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' }
        },
        quotes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// Create customer
router.post('/', auth, async (req: AuthRequest, res, next) => {
  try {
    const data = customerSchema.parse(req.body);

    // Generate customer number
    const lastCustomer = await prisma.customer.findFirst({
      orderBy: { customerNumber: 'desc' }
    });

    const customerNumber = lastCustomer 
      ? (parseInt(lastCustomer.customerNumber) + 1).toString().padStart(5, '0')
      : '00001';

    const customer = await prisma.customer.create({
      data: {
        ...data,
        customerNumber
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// Update customer
router.put('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    const data = customerSchema.parse(req.body);

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data
    });

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// Delete customer
router.delete('/:id', auth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
