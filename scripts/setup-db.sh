#!/bin/bash
cd /home/rownak/projects/event-planner-pro
export NEON_URL='postgresql://neondb_owner:***@ep-spring-shadow-aoayisjx-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.NEON_URL);
async function main() {
  const v = await sql\`SELECT version()\`;
  console.log('Connected:', v[0].version?.substring(0, 50));
  await sql\`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(320) UNIQUE NOT NULL, name VARCHAR(200), password_hash VARCHAR(200) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())\`;
  console.log('users OK');
  await sql\`CREATE TABLE IF NOT EXISTS events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), owner_user_id UUID NOT NULL, title VARCHAR(200) NOT NULL, description TEXT, location VARCHAR(200), event_date TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())\`;
  console.log('events OK');
  await sql\`CREATE INDEX IF NOT EXISTS idx_events_owner ON events (owner_user_id, created_at DESC)\`;
  console.log('events index OK');
  await sql\`CREATE TABLE IF NOT EXISTS event_invites (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID UNIQUE NOT NULL REFERENCES events(id) ON DELETE CASCADE, token VARCHAR(100) UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT now())\`;
  console.log('invites OK');
  await sql\`CREATE TABLE IF NOT EXISTS event_rsvps (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE, invite_id UUID REFERENCES event_invites(id) ON DELETE SET NULL, name VARCHAR(200) NOT NULL, email VARCHAR(320) NOT NULL, email_normalized VARCHAR(320) NOT NULL, status VARCHAR(20) NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')), responded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE(event_id, email_normalized))\`;
  console.log('rsvps OK');
  await sql\`CREATE INDEX IF NOT EXISTS idx_rsvps_event ON event_rsvps (event_id, responded_at DESC)\`;
  console.log('rsvps index OK');
  const tables = await sql\`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name\`;
  console.log('Tables:', tables.map(t => t.table_name).join(', '));
  const existing = await sql\`SELECT id FROM users WHERE email = 'admin@eventplanner.pro'\`;
  if (existing.length === 0) {
    const enc = new TextEncoder();
    const data = enc.encode('password123event-planner-salt');
    const buf = await crypto.subtle.digest('SHA-256', data);
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    await sql\`INSERT INTO users (email, name, password_hash) VALUES ('admin@eventplanner.pro', 'Admin', \${hash})\`;
    console.log('admin user created');
  }
  console.log('DONE');
}
main().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
"
