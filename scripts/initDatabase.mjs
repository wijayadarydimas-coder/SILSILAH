import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;
const host = process.env.PGHOST;
const port = parseInt(process.env.PGPORT, 10);
const user = process.env.PGUSER;
const password = process.env.PGPASSWORD;
const dbName = process.env.PGDATABASE;
const ssl = process.env.DATABASE_SSL === 'false' ? false : (databaseUrl || process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined);

const superadminUsername = (process.env.SUPERADMIN_USERNAME || 'silsilah').trim().toLowerCase();
const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'silsilah123';
const superadminDisplayName = process.env.SUPERADMIN_DISPLAY_NAME || 'Superadmin SILSILAH';

if (!databaseUrl && !password) {
  console.error('❌ Error: Variabel PGPASSWORD atau DATABASE_URL tidak ditemukan!');
  console.error('Harap pastikan file .env.local sudah berisi PGPASSWORD atau DATABASE_URL.');
  process.exit(1);
}

async function init() {
  console.log('==================================================');
  console.log('🚀 INISIALISASI DATABASE SILSILAH');
  console.log('==================================================');
  if (databaseUrl) {
    console.log(`Database URL: Terkonfigurasi (Cloud / Hosting)`);
  } else {
    console.log(`Host: ${host}:${port}`);
    console.log(`User: ${user}`);
    console.log(`Database: ${dbName}`);
  }
  console.log(`Superadmin: ${superadminUsername}`);
  console.log('--------------------------------------------------');

  // 1. Jika localhost (tanpa DATABASE_URL), pastikan database ada di server PostgreSQL
  if (!databaseUrl) {
    const rootClient = new Client({ host, port, user, password, database: 'postgres', ssl });
    try {
      await rootClient.connect();
      const checkRes = await rootClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
      if (checkRes.rows.length === 0) {
        console.log(`[1/3] Membuat database baru "${dbName}"...`);
        await rootClient.query(`CREATE DATABASE "${dbName}"`);
        console.log(`✓ Database "${dbName}" berhasil dibuat!`);
      } else {
        console.log(`✓ Database "${dbName}" sudah tersedia.`);
      }
    } catch (err) {
      console.warn(`[Info] Root check note: ${err.message}`);
    } finally {
      try {
        await rootClient.end();
      } catch {}
    }
  }

  // 2. Hubungkan ke database aplikasi & buat tabel-tabel
  const appClient = databaseUrl
    ? new Client({ connectionString: databaseUrl, ssl })
    : new Client({ host, port, user, password, database: dbName, ssl });
  await appClient.connect();

  try {
    console.log('[2/3] Memeriksa dan membuat tabel-tabel silsilah...');

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
        linked_user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
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

      CREATE TABLE IF NOT EXISTS password_reset_requests (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL,
        display_name VARCHAR(255),
        contact_type VARCHAR(50) NOT NULL,
        contact_value VARCHAR(255) NOT NULL,
        token VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS community_messages (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        user_role VARCHAR(50) NOT NULL DEFAULT 'client',
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `);

    // Pastikan kolom baru ter-alter bila tabel sudah ada dari versi sebelumnya
    await appClient.query(`
      ALTER TABLE people ADD COLUMN IF NOT EXISTS photo_zoom NUMERIC DEFAULT 1;
      ALTER TABLE people ADD COLUMN IF NOT EXISTS photo_offset_x NUMERIC DEFAULT 0;
      ALTER TABLE people ADD COLUMN IF NOT EXISTS photo_offset_y NUMERIC DEFAULT 0;
      ALTER TABLE people ADD COLUMN IF NOT EXISTS linked_user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS linked_person_id VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);

    console.log('✓ Struktur tabel PostgreSQL lengkap & siap.');

    // 3. Workspace awal
    const wsRes = await appClient.query('SELECT id FROM workspaces LIMIT 1');
    if (wsRes.rows.length === 0) {
      await appClient.query(
        `INSERT INTO workspaces (id, name, code, description) VALUES ($1, $2, $3, $4)`,
        [
          'ws-sastrohusodo-01',
          'Keluarga Besar SILSILAH',
          'SILSILAH-2026',
          'Arsip digital silsilah dan pohon keluarga interaktif',
        ]
      );
      console.log('✓ Ruang keluarga awal dibuat.');
    }

    // 4. Pastikan Superadmin dari .env.local terdaftar
    console.log('[3/3] Memeriksa akun Superadmin...');
    const userRes = await appClient.query('SELECT id, password_hash FROM users WHERE username = $1', [superadminUsername]);
    const passwordHash = await bcrypt.hash(superadminPassword, 10);

    if (userRes.rows.length === 0) {
      await appClient.query(
        `INSERT INTO users (id, username, display_name, password_hash, role, status)
         VALUES ($1, $2, $3, $4, 'superadmin', 'active')`,
        [
          'usr-superadmin-static',
          superadminUsername,
          superadminDisplayName,
          passwordHash,
        ]
      );
      console.log(`✓ Akun Superadmin "${superadminUsername}" berhasil dibuat dengan enkripsi bcrypt.`);
    } else {
      await appClient.query(
        `UPDATE users SET password_hash = $1, display_name = $2, role = 'superadmin', status = 'active' WHERE username = $3`,
        [passwordHash, superadminDisplayName, superadminUsername]
      );
      console.log(`✓ Akun Superadmin "${superadminUsername}" diperbarui dengan kata sandi terbaru dari .env.local.`);
    }

    console.log('==================================================');
    console.log('🎉 Inisialisasi Database Selesai! Siap digunakan.');
    console.log('==================================================');
  } catch (err) {
    console.error('❌ Gagal inisialisasi database:', err);
  } finally {
    await appClient.end();
  }
}

init().catch(console.error);
