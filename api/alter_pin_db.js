const db = require('./models');

async function alterTable() {
    try {
        await db.sequelize.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "pin_attempts" INTEGER DEFAULT 0;');
        await db.sequelize.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "pin_locked_until" TIMESTAMP WITH TIME ZONE;');
        console.log('Columns added successfully');
    } catch (error) {
        console.error('Error altering table:', error);
    } finally {
        process.exit();
    }
}

alterTable();
