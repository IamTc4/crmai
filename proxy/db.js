const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

async function getDbConnection() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}

async function initializeDatabase() {
    const db = await getDbConnection();

    // Create Leads Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            project TEXT,
            source TEXT,
            value INTEGER,
            score INTEGER,
            stage TEXT NOT NULL,
            days_in_stage INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Check if seeding is needed
    const countResult = await db.get('SELECT COUNT(*) as count FROM leads');
    if (countResult.count === 0) {
        console.log('Seeding initial mock data...');
        const stmt = await db.prepare(`
            INSERT INTO leads (name, project, source, value, score, stage, days_in_stage)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        await stmt.run('Arjun Desai', 'Lodha Amara', 'Google Search', 12000000, 92, 'New', 1);
        await stmt.run('Neha S.', 'Godrej Woods', 'Meta Ad', 18000000, 65, 'Contacted', 3);
        await stmt.run('Vikram R.', 'Prestige Falcon', 'Referral', 25000000, 88, 'Interested', 2);
        await stmt.run('Priya M.', 'Sobha City', 'Website', 9000000, 45, 'Visit Scheduled', 0);
        await stmt.run('Rahul T.', 'Lodha Amara', 'Walk-in', 15000000, 78, 'Negotiating', 5);
        await stmt.run('Sunil K.', 'Godrej Woods', 'Meta Ad', 22000000, 95, 'Closed', 12);

        await stmt.finalize();
        console.log('Database seeded successfully.');
    } else {
        console.log('Database already contains data, skipping seed.');
    }

    return db;
}

module.exports = {
    getDbConnection,
    initializeDatabase
};
