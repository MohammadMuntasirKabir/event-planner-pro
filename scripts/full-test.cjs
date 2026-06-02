const { PrismaNeonHttp } = require("@prisma/adapter-neon");
const { PrismaClient } = require("@prisma/client");
const https = require("https");

const rawUrl = process.env.DATABASE_URL;
const connectionString = rawUrl.replace(/&?channel_binding=[^&]*/, "");

function neonQuery(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql, params: [] });
    const urlObj = new URL(connectionString);
    const req = https.request({
      hostname: urlObj.hostname,
      path: "/sql",
      method: "POST",
      headers: { "Content-Type": "application/json", "Neon-Connection-String": connectionString }
    }, (res) => {
      let body = "";
      res.on("data", d => body += d);
      res.on("end", () => { try { resolve(JSON.parse(body)); } catch(e) { resolve({ error: body }); } });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function generateToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
}

async function main() {
  console.log("=== Neon Database Setup & Prisma Test ===\n");

  // Step 1: Create enum type + tables
  console.log("[1] Creating enum type and tables...");
  const ddl = [
    `DO $$
    BEGIN
      CREATE TYPE "RsvpStatus" AS ENUM ('going', 'maybe', 'not_going');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$`,
    'CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(320) UNIQUE NOT NULL, name VARCHAR(200), password_hash VARCHAR(200) NOT NULL, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())',
    'CREATE TABLE IF NOT EXISTS events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), owner_user_id UUID NOT NULL, title VARCHAR(200) NOT NULL, description TEXT, location VARCHAR(200), event_date TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())',
    'CREATE INDEX IF NOT EXISTS idx_events_owner ON events (owner_user_id, created_at DESC)',
    'CREATE TABLE IF NOT EXISTS event_invites (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID UNIQUE NOT NULL REFERENCES events(id) ON DELETE CASCADE, token VARCHAR(100) UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT now())',
    'CREATE TABLE IF NOT EXISTS event_rsvps (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE, invite_id UUID REFERENCES event_invites(id) ON DELETE SET NULL, name VARCHAR(200) NOT NULL, email VARCHAR(320) NOT NULL, email_normalized VARCHAR(320) NOT NULL, status "RsvpStatus" NOT NULL, responded_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE(event_id, email_normalized))',
    'CREATE INDEX IF NOT EXISTS idx_rsvps_event ON event_rsvps (event_id, responded_at DESC)',
  ];
  for (const sql of ddl) {
    await neonQuery(sql);
    console.log("  OK: " + sql.substring(0, 60));
  }

  // Step 2: Verify
  console.log("\n[2] Verifying...");
  const tables = await neonQuery("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
  console.log("  Tables:", (tables.rows || []).map(r => r.table_name).join(", "));

  const types = await neonQuery("SELECT typname FROM pg_type WHERE typtype='e' ORDER BY typname");
  console.log("  Enums:", (types.rows || []).map(r => r.typname).join(", "));

  // Step 3: Seed admin
  console.log("\n[3] Seeding...");
  const existing = await neonQuery("SELECT id FROM users WHERE email='admin@eventplanner.pro'");
  if (!existing.rows?.length) {
    const enc = new TextEncoder();
    const data = enc.encode("password123event-planner-salt");
    const buf = await crypto.subtle.digest("SHA-256", data);
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    await neonQuery("INSERT INTO users (email, name, password_hash) VALUES ('admin@eventplanner.pro', 'Admin', '" + hash + "')");
    console.log("  Admin created (admin@eventplanner.pro / password123)");
  } else {
    console.log("  Admin exists");
  }

  // Step 4: Prisma test
  console.log("\n[4] Prisma test...");
  const adapter = new PrismaNeonHttp(connectionString, {});
  const client = new PrismaClient({ adapter });

  try {
    const count = await client.user.count();
    console.log("  Users:", count);

    const admin = await client.user.findUnique({ where: { email: "admin@eventplanner.pro" } });

    if (admin) {
      const ev = await client.event.create({
        data: { ownerUserId: admin.id, title: "Neon Test", description: "Full integration", location: "Cloud" },
      });
      console.log("  Event:", ev.title);

      const token = generateToken();
      const inv = await client.eventInvite.create({ data: { eventId: ev.id, token } });
      console.log("  Invite:", token.substring(0, 10) + "...");

      await client.eventRsvp.create({ data: { eventId: ev.id, inviteId: inv.id, name: "Alice", email: "a@t.com", emailNormalized: "a@t.com", status: "going" } });
      await client.eventRsvp.create({ data: { eventId: ev.id, name: "Bob", email: "b@t.com", emailNormalized: "b@t.com", status: "maybe" } });
      console.log("  RSVPs: 2 created");

      const full = await client.event.findUnique({
        where: { id: ev.id },
        include: { rsvps: true, invite: true },
      });
      console.log("  Query:", full.rsvps.length, "rsvps, invite:", !!full.invite);

      await client.event.delete({ where: { id: ev.id } });
      console.log("  Cleanup done");
    }

    await client.$disconnect();
    console.log("\n=== ALL PASSED ===");
  } catch(e) {
    console.error("  ERROR:", e.message);
    await client.$disconnect().catch(() => {});
    process.exit(1);
  }
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
