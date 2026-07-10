import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, GigModel, OrderModel, MessageModel } from './MongooseModels';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'chidon_elite_secret_key';

// Extend Express Request interface to include user payload
interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: 'buyer' | 'seller';
  };
}

// ---------------------------------------------------------
// JWT VERIFICATION MIDDLEWARE (AUTH GUARD)
// ---------------------------------------------------------
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required. Access Denied.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uid: string; email: string; role: 'buyer' | 'seller' };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authorization token.' });
  }
};

// Role-based route guard helper
export const checkRole = (role: 'buyer' | 'seller') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Access Restricted: Requires ${role} role permissions.` });
    }
    next();
  };
};

// =========================================================================
// 1. AUTHENTICATION & PROFILE CONTROLLERS
// =========================================================================

// Sync User and Switch Roles
router.post('/auth/sync', async (req: Request, res: Response) => {
  const { uid, email, username, fullName, avatarURL } = req.body;
  try {
    let user = await UserModel.findOne({ uid });
    if (!user) {
      user = new UserModel({
        uid,
        email,
        username: username || email.split('@')[0],
        fullName: fullName || email.split('@')[0],
        avatarURL: avatarURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${uid}`,
        role: 'buyer',
        skills: [],
        languages: ['English']
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ uid: user.uid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ success: true, token, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update profile settings / Swapping Active Role
router.patch('/profile/role', requireAuth, async (req: AuthRequest, res: Response) => {
  const { newRole } = req.body;
  if (!['buyer', 'seller'].includes(newRole)) {
    return res.status(400).json({ error: 'Invalid role value.' });
  }
  try {
    const user = await UserModel.findOneAndUpdate(
      { uid: req.user?.uid },
      { role: newRole },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User profile not found.' });

    // Generate updated JWT with new role
    const token = jwt.sign({ uid: user.uid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ success: true, token, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 2. GIGS MANAGEMENT CONTROLLERS
// =========================================================================

// List and Browse Gigs (Filtered)
router.get('/gigs', async (req: Request, res: Response) => {
  const { category, minBudget, maxBudget, search } = req.query;
  const filter: any = {};

  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: 'i' };
  
  if (minBudget || maxBudget) {
    filter['packages.basic.price'] = {};
    if (minBudget) filter['packages.basic.price'].$gte = parseFloat(minBudget as string);
    if (maxBudget) filter['packages.basic.price'].$lte = parseFloat(maxBudget as string);
  }

  try {
    const gigs = await GigModel.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, gigs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Create new Gig Listing (Seller Only)
router.post('/gigs', requireAuth, checkRole('seller'), async (req: AuthRequest, res: Response) => {
  const { title, description, category, gallery, packages } = req.body;
  try {
    const user = await UserModel.findOne({ uid: req.user?.uid });
    if (!user) return res.status(404).json({ error: 'Seller profile not found' });

    const newGig = new GigModel({
      userId: req.user?.uid,
      sellerName: user.fullName || user.username,
      title,
      description,
      category,
      gallery,
      packages
    });

    await newGig.save();
    return res.status(201).json({ success: true, gig: newGig });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 3. PAYSTACK ESCROW ORDER WORKSPACES
// =========================================================================

// Initialize Paystack Checkout transaction
router.post('/orders/initialize-payment', requireAuth, async (req: AuthRequest, res: Response) => {
  const { gigId, packageType, amountUsd } = req.body;
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  
  if (!paystackSecret) {
    return res.status(500).json({ error: 'Paystack checkout is not configured.' });
  }

  try {
    const gig = await GigModel.findById(gigId);
    if (!gig) return res.status(404).json({ error: 'Service gig not found.' });

    const paystackRef = `CHIDON_ESC_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const exchangeRate = parseFloat(process.env.USD_TO_NGN_RATE || '1500');
    const amountNgn = amountUsd * exchangeRate;
    const amountKobo = Math.round(amountNgn * 100);

    // Initializing order in pending status
    const order = new OrderModel({
      buyerId: req.user?.uid,
      buyerName: req.user?.email.split('@')[0],
      sellerId: gig.userId,
      sellerName: gig.sellerName,
      gigId: gig._id,
      gigTitle: gig.title,
      packageType,
      amount: amountUsd,
      reference: paystackRef,
      paymentStatus: 'pending',
      escrowState: 'escrowed'
    });
    await order.save();

    // Call Paystack initialization API
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: req.user?.email,
        amount: amountKobo,
        currency: 'NGN',
        reference: paystackRef,
        callback_url: `${req.protocol}://${req.get('host')}/api/orders/verify-payment`
      })
    });

    const paystackData = await paystackRes.json() as any;
    if (!paystackRes.ok || !paystackData.status) {
      throw new Error(paystackData.message || 'Paystack initialize failure');
    }

    return res.json({ success: true, authorizationUrl: paystackData.data.authorization_url, reference: paystackRef });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Verify Paystack checkout signature
router.post('/orders/verify-payment', async (req: Request, res: Response) => {
  const { reference } = req.body;
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`
      }
    });

    const verifyData = await paystackRes.json() as any;
    if (!paystackRes.ok || !verifyData.status || verifyData.data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Transaction check unsuccessful.' });
    }

    // Move pending escrow order to successful
    const order = await OrderModel.findOneAndUpdate(
      { reference },
      { paymentStatus: 'success', escrowState: 'escrowed' },
      { new: true }
    );

    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Deliver orders (Seller)
router.patch('/orders/:id/deliver', requireAuth, checkRole('seller'), async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  try {
    const order = await OrderModel.findOneAndUpdate(
      { _id: orderId, sellerId: req.user?.uid },
      { escrowState: 'delivered' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Release payment (Buyer satisfaction approval)
router.patch('/orders/:id/complete', requireAuth, checkRole('buyer'), async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  try {
    const order = await OrderModel.findOneAndUpdate(
      { _id: orderId, buyerId: req.user?.uid, escrowState: 'delivered' },
      { escrowState: 'completed' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order must be delivered first.' });

    // Transfer funds to Seller earnings balance
    await UserModel.findOneAndUpdate(
      { uid: order.sellerId },
      { $inc: { earnings: order.amount, totalOrders: 1 } }
    );

    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
