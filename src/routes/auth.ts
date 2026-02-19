import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await admin.comparePassword(password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const token = jwt.sign(
      { id: admin._id.toString(), username: admin.username },
      secret,
      { expiresIn: '24h' }
    );

    res.json({ token, username: admin.username });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/verify
router.get('/verify', authMiddleware, (req: Request, res: Response): void => {
  res.json({ valid: true, admin: req.admin });
});

export default router;
