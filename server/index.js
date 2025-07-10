const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// GET /api/next-bin-day?postcode=DA11 9AA
app.get('/api/next-bin-day', async (req, res) => {
//   const postcode = req.query.postcode;
const postcode = 'DA11 9AA';
// if (!postcode) {
//     return res.status(400).json({ error: 'postcode is required' });
//   }
  try {
    const nextBinDay = await prisma.binDay.findFirst({
      where: {
        postcode,
        date: {
          gte: new Date()
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    if (!nextBinDay) {
      return res.status(404).json({ error: 'No upcoming bin days found.' });
    }
    res.json(nextBinDay);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
