import express from 'express';
import pool from '../config/database';

const router = express.Router();

router.get('/cases', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
    const offset = Math.max(0, parseInt(String(req.query.offset ?? '0'), 10) || 0);
    const chain = typeof req.query.chain === 'string' && req.query.chain ? req.query.chain : undefined;
    const sortColumn = req.query.sort === 'published_date' ? 'published_date' : 'risk_score';
    const sortOrder = req.query.order === 'asc' ? 'ASC' : 'DESC';

    const filterValues: (string | number)[] = [];
    let whereClause = 'published = true';
    if (chain) {
      filterValues.push(chain);
      whereClause += ` AND chain = $${filterValues.length}`;
    }

    const listValues = [...filterValues, limit, offset];
    const limitIdx = filterValues.length + 1;
    const offsetIdx = filterValues.length + 2;

    const result = await pool.query(
      `SELECT id, protocol_name, contract_address, chain, risk_score, confidence, classification,
              predicted_collapse, estimated_loss, published_date
       FROM case_studies
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      listValues
    );

    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM case_studies WHERE ${whereClause}`, filterValues);

    res.json({
      cases: result.rows,
      pagination: {
        limit,
        offset,
        total: countResult.rows[0].total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch case studies' });
  }
});

router.get('/cases/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid case id' });
    }

    const result = await pool.query('SELECT * FROM case_studies WHERE id = $1 AND published = true', [id]);
    const caseStudy = result.rows[0];
    if (!caseStudy) {
      return res.status(404).json({ error: 'Case study not found' });
    }

    res.json({
      ...caseStudy,
      downloads: {
        json: `/api/cases/${id}`,
        pdf: null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch case study' });
  }
});

export default router;
