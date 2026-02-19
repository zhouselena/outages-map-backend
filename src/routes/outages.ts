import { Router, Request, Response } from 'express';
import multer from 'multer';
import Outage from '../models/Outage';
import { authMiddleware } from '../middleware/auth';
import { resolveRegion } from '../utils/regionMap';
import { parseCSVBuffer } from '../utils/csvParser';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── GET /api/outages ──────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, provider, region, page = '1', limit = '500' } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};

    if (year) {
      const y = parseInt(year);
      filter['start_date'] = {
        $gte: new Date(`${y}-01-01`),
        $lt:  new Date(`${y + 1}-01-01`),
      };
    }
    if (provider) filter['provider'] = provider;
    if (region)   filter['region_key'] = new RegExp(region, 'i');

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);

    const [outages, total] = await Promise.all([
      Outage.find(filter)
        .sort({ start_date: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean(),
      Outage.countDocuments(filter),
    ]);

    res.json({ outages, total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
});

// ── GET /api/outages/years ────────────────────────────────────────────────────
router.get('/years', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await Outage.aggregate<{ _id: number }>([
      { $group: { _id: { $year: '$start_date' } } },
      { $sort:  { _id: 1 } },
    ]);
    const years = result.map(r => r._id).filter(Boolean);
    res.json({ years });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/outages/stats ────────────────────────────────────────────────────
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { year } = req.query as { year?: string };
    const matchStage: Record<string, unknown> = {};

    if (year) {
      const y = parseInt(year);
      matchStage['start_date'] = {
        $gte: new Date(`${y}-01-01`),
        $lt:  new Date(`${y + 1}-01-01`),
      };
    }

    const stats = await Outage.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id:          '$region_key',
          count:        { $sum: 1 },
          providers:    { $addToSet: '$provider' },
          avg_duration: { $avg: '$duration_hours' },
          max_duration: { $max: '$duration_hours' },
          lat:          { $first: '$coordinates.lat' },
          lng:          { $first: '$coordinates.lng' },
          region:       { $first: '$region' },
          outages: {
            $push: {
              _id:             '$_id',
              description:     '$description',
              event_type:      '$event_type',
              provider:        '$provider',
              service:         '$service',
              start_date:      '$start_date',
              end_date:        '$end_date',
              duration_hours:  '$duration_hours',
              severity:        '$severity',
              downstream_apps: '$downstream_apps',
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: (err as Error).message });
  }
});

// ── GET /api/outages/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const outage = await Outage.findById(req.params.id);
    if (!outage) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(outage);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/outages ─────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as Record<string, unknown>;

    const regionInfo = resolveRegion(data['region'] as string | undefined);
    if (regionInfo && !data['coordinates']) {
      data['coordinates'] = { lat: regionInfo.lat, lng: regionInfo.lng };
      data['region_key']  = regionInfo.region_key;
    } else if (!data['region_key']) {
      data['region_key'] = ((data['region'] as string) ?? '').toLowerCase().trim();
    }

    const outage = new Outage(data);
    await outage.save();
    res.status(201).json(outage);
  } catch (err) {
    res.status(400).json({ error: 'Validation error', details: (err as Error).message });
  }
});

// ── POST /api/outages/import ──────────────────────────────────────────────────
router.post(
  '/import',
  authMiddleware,
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

      const outages = parseCSVBuffer(req.file.buffer);
      if (outages.length === 0) {
        res.status(400).json({ error: 'No valid outages found in CSV' });
        return;
      }

      const inserted = await Outage.insertMany(outages, { ordered: false });
      res.json({ imported: inserted.length, total: outages.length });
    } catch (err) {
      res.status(500).json({ error: 'Import error', details: (err as Error).message });
    }
  }
);

// ── PUT /api/outages/:id ──────────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as Record<string, unknown>;
    const regionInfo = resolveRegion(data['region'] as string | undefined);
    if (regionInfo) {
      data['coordinates'] = { lat: regionInfo.lat, lng: regionInfo.lng };
      data['region_key']  = regionInfo.region_key;
    }

    const outage = await Outage.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!outage) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(outage);
  } catch (err) {
    res.status(400).json({ error: 'Update error', details: (err as Error).message });
  }
});

// ── DELETE /api/outages/:id ───────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const outage = await Outage.findByIdAndDelete(req.params.id);
    if (!outage) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({ deleted: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
