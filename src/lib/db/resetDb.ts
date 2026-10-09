import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

export async function resetDatabaseClean() {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || '';
  const dbName = process.env.PGDATABASE || 'silsilah_db';

  const superadminUsername = (process.env.SUPERADMIN_USERNAME || 'silsilah').trim().toLowerCase();
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'silsilah123';
  const superadminDisplayName = process.env.SUPERADMIN_DISPLAY_NAME || 'Superadmin SILSILAH';

  const appClient = new Client({ host, port, user, password, database: dbName });
  await appClient.connect();

  try {
    console.log('[DB] Running clean migration and wiping all test data...');

    // Add columns if they don't exist
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'client',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        linked_person_id VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS people (
        id VARCHAR(100) PRIMARY KEY,
        workspace_id VARCHAR(100) NOT NULL REFERENCES workspaces(id),
        full_name VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        gender VARCHAR(50) NOT NULL,
        birth_date VARCHAR(50),
        death_date VARCHAR(50),
        is_deceased BOOLEAN DEFAULT FALSE,
        biography TEXT,
        address TEXT,
        phone VARCHAR(100),
        email VARCHAR(100),
        instagram VARCHAR(100),
        photo_url TEXT,
        photo_zoom NUMERIC DEFAULT 1,
        photo_offset_x NUMERIC DEFAULT 0,
        photo_offset_y NUMERIC DEFAULT 0,
        verification_status VARCHAR(50) DEFAULT 'verified',
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS parent_child_relationships (
        id VARCHAR(100) PRIMARY KEY,
        workspace_id VARCHAR(100) NOT NULL REFERENCES workspaces(id),
        parent_person_id VARCHAR(100) NOT NULL REFERENCES people(id) ON DELETE CASCADE,
        child_person_id VARCHAR(100) NOT NULL REFERENCES people(id) ON DELETE CASCADE,
        parent_role VARCHAR(50) NOT NULL,
        parentage_type VARCHAR(50) NOT NULL DEFAULT 'biological',
        notes TEXT,
        verified_status VARCHAR(50) DEFAULT 'verified'
      );

      CREATE TABLE IF NOT EXISTS partnership_relationships (
        id VARCHAR(100) PRIMARY KEY,
        workspace_id VARCHAR(100) NOT NULL REFERENCES workspaces(id),
        person_a_id VARCHAR(100) NOT NULL REFERENCES people(id) ON DELETE CASCADE,
        person_b_id VARCHAR(100) NOT NULL REFERENCES people(id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) NOT NULL DEFAULT 'married',
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'current',
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(100) PRIMARY KEY,
        workspace_id VARCHAR(100) NOT NULL REFERENCES workspaces(id),
        actor_user_id VARCHAR(100) NOT NULL,
        actor_name VARCHAR(255) NOT NULL,
        actor_role VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(100) NOT NULL,
        target_id VARCHAR(100) NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        summary TEXT NOT NULL
      );
    `);

    // Ensure alter columns exist in people and users
    await appClient.query(`
      ALTER TABLE people ADD COLUMN IF NOT EXISTS photo_zoom NUMERIC DEFAULT 1;
      ALTER TABLE people ADD COLUMN IF NOT EXISTS photo_offset_x NUMERIC DEFAULT 0;
      ALTER TABLE people ADD COLUMN IF NOT EXISTS photo_offset_y NUMERIC DEFAULT 0;
      ALTER TABLE people ADD COLUMN IF NOT EXISTS linked_user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS linked_person_id VARCHAR(100);
    `);

    // WIPE ALL EXISTING DUMMY DATA CLEANLY
    await appClient.query('DELETE FROM audit_logs');
    await appClient.query('DELETE FROM parent_child_relationships');
    await appClient.query('DELETE FROM partnership_relationships');
    await appClient.query('DELETE FROM people');
    await appClient.query('DELETE FROM users WHERE username != $1', [superadminUsername]);

    // Ensure Workspace exists with customizable name
    const wsRes = await appClient.query('SELECT id FROM workspaces LIMIT 1');
    if (wsRes.rows.length === 0) {
      await appClient.query(
        `INSERT INTO workspaces (id, name, code, description)
         VALUES ('ws-default-01', 'Keluarga Besar SILSILAH', 'SILSILAH-2026', 'Ruang silsilah keluarga digital')`
      );
    }

    // Hash superadmin password from environment variable
    const passwordHash = await bcrypt.hash(superadminPassword, 10);

    // Upsert the single static Superadmin
    const saCheck = await appClient.query('SELECT id FROM users WHERE username = $1', [superadminUsername]);
    if (saCheck.rows.length === 0) {
      await appClient.query(
        `INSERT INTO users (id, username, display_name, password_hash, role, status)
         VALUES ('usr-superadmin-static', $1, $2, $3, 'superadmin', 'active')`,
        [superadminUsername, superadminDisplayName, passwordHash]
      );
    } else {
      await appClient.query(
        `UPDATE users
         SET password_hash = $1, display_name = $2, role = 'superadmin', status = 'active'
         WHERE username = $3`,
        [passwordHash, superadminDisplayName, superadminUsername]
      );
    }

    console.log(`[DB] Database is now completely clean! Only Superadmin "${superadminUsername}" exists.`);
  } finally {
    await appClient.end();
  }
}
