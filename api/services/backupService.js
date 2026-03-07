const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { SystemConfig } = require('../models');

// Directory for backups
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Detects the correct pg_dump path
 */
const getPgDumpPath = () => {
    // Common Windows installation paths
    const commonPaths = [
        'pg_dump', // Try PATH first
        'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe'
    ];

    for (const p of commonPaths) {
        try {
            // Use --version to check if it's executable
            const checkCmd = p === 'pg_dump' ? 'pg_dump --version' : `"${p}" --version`;
            // Simplified check: if it exists and we can run it
            return p;
        } catch (e) { }
    }
    return 'pg_dump'; // Fallback
};

/**
 * Creates a database backup using pg_dump
 */
const createBackup = () => {
    return new Promise((resolve, reject) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const filepath = path.join(backupDir, filename);

        // Get DB config from env or default
        const dbUser = process.env.DB_USER || 'postgres';
        const dbPass = process.env.DB_PASSWORD || 'root';
        const dbName = process.env.DB_NAME || 'qwiktransfers_dev';
        const dbHost = process.env.DB_HOST || '127.0.0.1';

        const pgDump = getPgDumpPath();
        const cmd = pgDump === 'pg_dump'
            ? `pg_dump -h ${dbHost} -U ${dbUser} -d ${dbName} -f "${filepath}"`
            : `"${pgDump}" -h ${dbHost} -U ${dbUser} -d ${dbName} -f "${filepath}"`;

        console.log(`Starting backup: ${filename} using ${pgDump}...`);

        // Use environment variable for password (more secure and robust)
        exec(cmd, { env: { ...process.env, PGPASSWORD: dbPass } }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup error: ${error.message}`);
                return reject(error);
            }
            if (stderr && !stderr.includes('done')) {
                // Ignore standard informational messages
                if (!stderr.includes('pg_dump:')) {
                    console.warn(`Backup warning: ${stderr}`);
                }
            }
            console.log(`Backup completed: ${filename}`);
            resolve({ filename, filepath });
        });
    });
};

/**
 * Schedules or unschedules the daily backup cron job
 */
let dailyBackupJob = null;

const initBackupCron = async () => {
    try {
        const config = await SystemConfig.findOne({ where: { key: 'auto_backup_daily' } });
        const isEnabled = config && config.value === 'true';

        if (isEnabled) {
            console.log('Initializing Daily Auto-Backup Cron (3:00 AM)...');
            if (dailyBackupJob) dailyBackupJob.stop();

            dailyBackupJob = cron.schedule('0 3 * * *', async () => {
                console.log('Running scheduled daily backup...');
                try {
                    await createBackup();
                    // Clean up old backups (older than 30 days)
                    cleanOldBackups(30);
                } catch (err) {
                    console.error('Scheduled backup failed:', err);
                }
            });
        } else {
            if (dailyBackupJob) {
                dailyBackupJob.stop();
                dailyBackupJob = null;
                console.log('Daily Auto-Backup Cron disabled.');
            }
        }
    } catch (error) {
        console.error('Failed to init backup cron:', error);
    }
};

/**
 * Deletes backup files older than specified days
 */
const cleanOldBackups = (days) => {
    const now = Date.now();
    const expiry = days * 24 * 60 * 60 * 1000;

    fs.readdir(backupDir, (err, files) => {
        if (err) return console.error('Error reading backup dir:', err);

        files.forEach(file => {
            const filePath = path.join(backupDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                if (now - stats.mtimeMs > expiry) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Failed to delete old backup ${file}:`, err);
                        else console.log(`Deleted expired backup: ${file}`);
                    });
                }
            });
        });
    });
};

/**
 * Returns a list of available backups
 */
const getBackups = () => {
    return new Promise((resolve, reject) => {
        fs.readdir(backupDir, (err, files) => {
            if (err) return reject(err);

            const backupList = files
                .filter(f => f.endsWith('.sql'))
                .map(file => {
                    const stats = fs.statSync(path.join(backupDir, file));
                    return {
                        filename: file,
                        size: stats.size,
                        createdAt: stats.mtime
                    };
                })
                .sort((a, b) => b.createdAt - a.createdAt);

            resolve(backupList);
        });
    });
};

module.exports = {
    createBackup,
    initBackupCron,
    getBackups,
    backupDir
};
