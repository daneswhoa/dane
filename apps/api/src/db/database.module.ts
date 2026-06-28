import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../../.env') });

import { Module, Global, OnModuleInit, Inject } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { URL } from 'url';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        const dbUrl = new URL(process.env.DATABASE_URL!);
        const pool = new Pool({
          user: dbUrl.username,
          password: decodeURIComponent(dbUrl.password),
          host: dbUrl.hostname,
          port: parseInt(dbUrl.port || '5432'),
          database: dbUrl.pathname.slice(1),
          ssl: {
            rejectUnauthorized: false,
          },
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

  async onModuleInit() {
    console.log('Ensuring audit_logs table exists...');
    try {
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR(255) PRIMARY KEY,
          owner_id VARCHAR(255) NOT NULL,
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
      console.log('Table audit_logs is ready.');
      
      console.log('Ensuring automations table exists...');
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS automations (
          id VARCHAR(255) PRIMARY KEY,
          owner_id VARCHAR(255) NOT NULL,
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
      console.log('Table automations is ready.');

      console.log('Ensuring notifications table exists...');
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

      console.log('Ensuring announcements table exists...');
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS announcements (
          id VARCHAR(255) PRIMARY KEY,
          owner_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
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
      console.log('Table announcements is ready.');

      console.log('Ensuring todos table exists...');
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
    } catch (err) {
      console.error('Failed to auto-create tables:', err);
    }
  }
}
