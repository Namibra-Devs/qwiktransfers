const { Rate } = require('../models');
const axios = require('axios'); // Needed for external API, ensure it's installed or use fetch

const getRates = async (req, res) => {
    try {
        // 1. Try to get rate from DB (cached)
        // 2. If old or missing, fetch from external API (simulated for now)
        // 3. Apply spread
        // 4. Return rate

        // For MVP, we will return a fixed rate or mock update
        const mockRate = 0.10; // 1 GHS = 0.10 CAD
        const spread = 0.005; // Our margin
        const finalRate = mockRate - spread; // Buying GHS, giving less CAD

        // Update or create in DB
        const [rateRecord, created] = await Rate.findOrCreate({
            where: { pair: 'GHS-CAD' },
            defaults: { rate: finalRate }
        });

        if (!created) {
            // Here we would check timestamp and update if needed
            rateRecord.rate = finalRate;
            await rateRecord.save();
        }

        res.json({ pair: 'GHS-CAD', rate: finalRate, fee_percentage: 1.0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getRates };
