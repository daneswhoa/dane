import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../../.env') });

import { Module, Global, OnModuleInit, Inject } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from './schema';

neonConfig.webSocketConstructor = ws;

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL!,
        });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule implements OnModuleInit {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}

  private async executeWithRetry(fn: () => Promise<void>, retries = 3, delayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await fn();
        return;
      } catch (err) {
        if (attempt === retries) throw err;
        console.warn(`Database not ready, retrying in ${delayMs / 1000}s... (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }

  async onModuleInit() {
    console.log('Ensuring tables exist...');
    try {
      await this.executeWithRetry(async () => {
        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id VARCHAR(255) PRIMARY KEY,
            owner_id VARCHAR(255) NOT NULL,
            organization_name VARCHAR(255),
            actor_name VARCHAR(255) NOT NULL,
            actor_email VARCHAR(255) NOT NULL,
            actor_initials VARCHAR(50) NOT NULL,
            category_icon_name VARCHAR(100) NOT NULL,
            category_label VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            ip VARCHAR(45) NOT NULL,
            location VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL,
            severity VARCHAR(50) NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `);
        await this.db.execute(sql`
          CREATE INDEX IF NOT EXISTS audit_logs_organization_name_idx ON audit_logs (organization_name);
        `);
        console.log('Table audit_logs is ready.');

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS automations (
            id VARCHAR(255) PRIMARY KEY,
            owner_id VARCHAR(255) NOT NULL,
            organization_name VARCHAR(255),
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            trigger_event VARCHAR(255) NOT NULL,
            trigger_offset_days INTEGER NOT NULL DEFAULT 0,
            trigger_condition VARCHAR(50) NOT NULL,
            template_id VARCHAR(255) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT FALSE,
            channel VARCHAR(50) NOT NULL DEFAULT 'Email',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
        await this.db.execute(sql`
          CREATE INDEX IF NOT EXISTS automations_owner_id_idx ON automations (owner_id);
        `);
        await this.db.execute(sql`
          CREATE INDEX IF NOT EXISTS automations_organization_name_idx ON automations (organization_name);
        `);
        console.log('Table automations is ready.');

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS notifications (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            link VARCHAR(500),
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `);
        await this.db.execute(sql`
          CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id);
        `);
        console.log('Table notifications is ready.');

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS announcements (
            id VARCHAR(255) PRIMARY KEY,
            owner_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
            organization_name VARCHAR(255),
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            audience_type VARCHAR(50) NOT NULL,
            target_property_id VARCHAR(255) REFERENCES properties(id) ON DELETE SET NULL,
            arrears_filter VARCHAR(50) NOT NULL,
            sent_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `);
        await this.db.execute(sql`
          CREATE INDEX IF NOT EXISTS announcements_owner_id_idx ON announcements (owner_id);
        `);
        await this.db.execute(sql`
          CREATE INDEX IF NOT EXISTS announcements_organization_name_idx ON announcements (organization_name);
        `);
        console.log('Table announcements is ready.');

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS todos (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            due_date TIMESTAMP WITH TIME ZONE NOT NULL,
            is_completed BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `);
        await this.db.execute(sql`
          CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos (user_id);
        `);
        console.log('Table todos is ready.');

        await this.db.execute(sql`
          CREATE TABLE IF NOT EXISTS contractor_bookmarks (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
            contractor_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `);
        await this.db.execute(sql`
          CREATE INDEX IF NOT EXISTS contractor_bookmarks_user_id_idx ON contractor_bookmarks (user_id);
        `);
        console.log('Table contractor_bookmarks is ready.');
      });

      console.log('All tables verified.');
    } catch (err) {
      console.error('Failed to auto-create tables after retries:', err);
    }
  }
}
