const { Rate } = require('../models');
const axios = require('axios'); // Needed for external API, ensure it's installed or use fetch

const getRates = async (req, res) => {
    try {
        // Fetch real market rate (GHS to CAD)
        // Public API: 1 GHS to others
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/GHS');
        const marketRate = response.data.rates.CAD;

        if (!marketRate) throw new Error('Could not fetch market rate');

        const spread = marketRate * 0.05; // 5% spread for fees and profit
        const finalRate = (marketRate - spread).toFixed(4);

        // Update or create in DB
        const [rateRecord, created] = await Rate.findOrCreate({
            where: { pair: 'GHS-CAD' },
            defaults: { rate: finalRate }
        });

        if (!created) {
            rateRecord.rate = finalRate;
            await rateRecord.save();
        }

        res.json({
            pair: 'GHS-CAD',
            rate: parseFloat(finalRate),
            market_rate: marketRate,
            fee_percentage: 5.0,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Rate fetch error:', error);
        // Fallback to DB if API fails
        const rateRecord = await Rate.findOne({ where: { pair: 'GHS-CAD' } });
        if (rateRecord) {
            return res.json({ pair: 'GHS-CAD', rate: rateRecord.rate, note: 'Using cached rate' });
        }
        res.status(500).json({ error: 'Failed to fetch rates' });
    }
};

module.exports = { getRates };
