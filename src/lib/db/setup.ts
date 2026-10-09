import pg from 'pg';
import bcrypt from 'bcryptjs';
import {
  INITIAL_WORKSPACE,
  INITIAL_PEOPLE,
  INITIAL_PARENT_CHILD,
  INITIAL_PARTNERSHIPS,
  INITIAL_AUDIT_LOGS,
} from '../seedData';

const { Client } = pg;

export async function setupDatabase() {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || '';
  const dbName = process.env.PGDATABASE || 'silsilah_db';

  // 1. Ensure silsilah_db exists
  const rootClient = new Client({ host, port, user, password, database: 'postgres' });
  try {
    await rootClient.connect();
    const checkRes = await rootClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (checkRes.rows.length === 0) {
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`[DB] Database "${dbName}" created successfully.`);
    }
  } catch (err: any) {
    console.warn('[DB] Root connection check warning:', err.message);
  } finally {
    await rootClient.end().catch(() => {});
  }

  // 2. Connect to silsilah_db and create schema
  const appClient = new Client({ host, port, user, password, database: dbName });
  await appClient.connect();

  try {
    // Create tables
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

    // 3. Ensure static Superadmin exists:
    // Username: silsilah
    // Password: silsilah 123
    const superadminCheck = await appClient.query("SELECT id FROM users WHERE username = 'silsilah'");
    const superadminHash = await bcrypt.hash('silsilah 123', 10);

    if (superadminCheck.rows.length === 0) {
      await appClient.query(
        `INSERT INTO users (id, username, display_name, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['usr-superadmin-static', 'silsilah', 'Superadmin SILSILAH', superadminHash, 'superadmin', 'active']
      );
      console.log('[DB] Static Superadmin created: username=silsilah, role=superadmin');
    } else {
      // Ensure role is superadmin and cannot be altered
      await appClient.query("UPDATE users SET role = 'superadmin', status = 'active' WHERE username = 'silsilah'");
    }

    // 4. Ensure default workspace exists
    const wsCheck = await appClient.query('SELECT id FROM workspaces WHERE id = $1', [INITIAL_WORKSPACE.id]);
    if (wsCheck.rows.length === 0) {
      await appClient.query(
        `INSERT INTO workspaces (id, name, code, description)
         VALUES ($1, $2, $3, $4)`,
        [INITIAL_WORKSPACE.id, INITIAL_WORKSPACE.name, INITIAL_WORKSPACE.code, INITIAL_WORKSPACE.description]
      );
      console.log('[DB] Workspace created:', INITIAL_WORKSPACE.name);
    }

    // 5. Seed initial people if empty
    const peopleCount = await appClient.query('SELECT count(*) FROM people WHERE workspace_id = $1', [
      INITIAL_WORKSPACE.id,
    ]);
    if (parseInt(peopleCount.rows[0].count, 10) === 0) {
      console.log('[DB] Seeding people, relationships, and audit logs into PostgreSQL...');
      for (const p of INITIAL_PEOPLE) {
        await appClient.query(
          `INSERT INTO people (
            id, workspace_id, full_name, display_name, gender, birth_date, death_date,
            is_deceased, biography, address, phone, email, instagram, photo_url, verification_status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            p.id,
            p.workspaceId,
            p.fullName,
            p.displayName || null,
            p.gender,
            p.birthDate || null,
            p.deathDate || null,
            p.isDeceased,
            p.biography || null,
            p.address || null,
            p.phone || null,
            p.email || null,
            p.instagram || null,
            p.photoUrl || null,
            p.verificationStatus,
            p.notes || null,
          ]
        );
      }

      for (const r of INITIAL_PARENT_CHILD) {
        await appClient.query(
          `INSERT INTO parent_child_relationships (
            id, workspace_id, parent_person_id, child_person_id, parent_role, parentage_type, notes, verified_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [r.id, r.workspaceId, r.parentPersonId, r.childPersonId, r.parentRole, r.parentageType, r.notes || null, r.verifiedStatus]
        );
      }

      for (const p of INITIAL_PARTNERSHIPS) {
        await appClient.query(
          `INSERT INTO partnership_relationships (
            id, workspace_id, person_a_id, person_b_id, relationship_type, start_date, end_date, status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [p.id, p.workspaceId, p.personAId, p.personBId, p.relationshipType, p.startDate || null, p.endDate || null, p.status, p.notes || null]
        );
      }

      for (const l of INITIAL_AUDIT_LOGS) {
        await appClient.query(
          `INSERT INTO audit_logs (
            id, workspace_id, actor_user_id, actor_name, actor_role, action, target_type, target_id, timestamp, summary
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [l.id, l.workspaceId, l.actorUserId, l.actorName, l.actorRole, l.action, l.targetType, l.targetId, l.timestamp, l.summary]
        );
      }
      console.log('[DB] Seeding completed successfully!');
    }

    console.log('[DB] Database tables and static superadmin verified.');
  } finally {
    await appClient.end();
  }
}
