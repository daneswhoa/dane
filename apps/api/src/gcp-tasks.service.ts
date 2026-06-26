import { CloudTasksClient } from '@google-cloud/tasks';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class GcpTasksService {
  private client: CloudTasksClient;
  private projectId!: string;
  private queue: string;
  private region: string;

  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID || 'landlordhungary';
    let clientOptions: any = {};
    let keyFilename: string | undefined;

    if (process.env.GCP_CREDENTIALS) {
      try {
        clientOptions.credentials = JSON.parse(process.env.GCP_CREDENTIALS);
        this.projectId = clientOptions.credentials.project_id;
        console.log('GCP credentials loaded from GCP_CREDENTIALS environment variable.');
      } catch (err: any) {
        console.error('Failed to parse GCP_CREDENTIALS environment variable as JSON:', err.message);
      }
    }

    if (!clientOptions.credentials) {
      const root = this.findMonorepoRoot(__dirname);
      const secretPath1 = path.resolve(root, 'apps/dashboard/secrets/gcp-service-account.json');
      const secretPath2 = path.resolve(root, 'apps/dashboard/secrets/landlordhungary-bf9deae337d2.json');

      if (fs.existsSync(secretPath1)) {
        keyFilename = secretPath1;
      } else if (fs.existsSync(secretPath2)) {
        keyFilename = secretPath2;
      }

      if (keyFilename) {
        clientOptions.keyFilename = keyFilename;
        try {
          const secret = JSON.parse(fs.readFileSync(keyFilename, 'utf8'));
          this.projectId = secret.project_id;
          console.log(`GCP credentials loaded from key file: ${keyFilename}`);
        } catch (e: any) {
          console.error(`Failed to parse key file ${keyFilename}:`, e.message);
          this.projectId = process.env.GCP_PROJECT_ID || 'landlordhungary';
        }
      } else {
        this.projectId = process.env.GCP_PROJECT_ID || 'landlordhungary';
      }
    }

    this.client = new CloudTasksClient(clientOptions);
    this.queue = process.env.GCP_QUEUE_NAME || 'broadcast-queue';
    this.region = process.env.GCP_REGION || 'europe-west2';
  }

  private findMonorepoRoot(startDir: string): string {
    let current = startDir;
    while (true) {
      if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml')) || fs.existsSync(path.join(current, 'pnpm-lock.yaml'))) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
    return startDir;
  }

  async queueTriggerTask(campaignId: string, scheduledAt: Date) {
    const parent = this.client.queuePath(this.projectId, this.region, this.queue);
    const url = `${process.env.PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/campaigns/${campaignId}/dispatch`;
    const secret = process.env.WEBHOOK_SECRET || process.env.BETTER_AUTH_SECRET || 'fallback-secret';

    const task: any = {
      httpRequest: {
        httpMethod: 'POST',
        url,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': secret,
        },
      },
    };

    if (scheduledAt) {
      const seconds = Math.floor(scheduledAt.getTime() / 1000);
      task.scheduleTime = {
        seconds,
      };
    }

    try {
      const [response] = await this.client.createTask({ parent, task });
      console.log(`Created trigger task: ${response.name}`);
      return response.name;
    } catch (error) {
      console.error('Error creating trigger task:', error);
      throw error;
    }
  }

  async queueEmailTask(campaignId: string, email: string, recipientName: string, subject: string, body: string) {
    const parent = this.client.queuePath(this.projectId, this.region, this.queue);
    const url = `${process.env.PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/campaigns/${campaignId}/send-email`;
    const secret = process.env.WEBHOOK_SECRET || process.env.BETTER_AUTH_SECRET || 'fallback-secret';

    const task: any = {
      httpRequest: {
        httpMethod: 'POST',
        url,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': secret,
        },
        body: Buffer.from(
          JSON.stringify({
            email,
            recipientName,
            subject,
            body,
          }),
        ).toString('base64'),
      },
    };

    try {
      const [response] = await this.client.createTask({ parent, task });
      console.log(`Created email task for ${email}: ${response.name}`);
      return response.name;
    } catch (error) {
      console.error('Error creating email task:', error);
      throw error;
    }
  }
}
