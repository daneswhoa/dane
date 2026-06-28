import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Req, Inject, Get, Patch, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { users, todos } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { Storage } from '@google-cloud/storage';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';

let storage: Storage | null = null;
try {
  storage = new Storage();
} catch (e) {
  console.log('GCS not configured, will skip actual upload if no credentials.');
}
const bucketName = process.env.GCS_BUCKET_NAME || 'landlordnl-assets';

@Controller('dashboard')
@UseGuards(SessionGuard)
export class DashboardController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any
  ) {}
  
  @Post('setup')
  @UseInterceptors(FileInterceptor('logo'))
  async setupOrganization(
    @Req() req: any,
    @Body() body: { organizationName: string, username: string, userId: string },
    @UploadedFile() file?: any
  ) {
    const { organizationName, username, userId } = body;
    const sessionUserId = req.user.id;

    if (userId && userId !== sessionUserId) {
      throw new BadRequestException('Access denied. You cannot modify another user\'s organization.');
    }
    
    if (!organizationName || !username) {
      throw new BadRequestException('Missing required fields');
    }

    // Check if username is taken
    const existingUser = await this.db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0 && existingUser[0].id !== sessionUserId) {
      throw new BadRequestException('Username is already taken');
    }

    let logoUrl = null;
    if (file && storage) {
      try {
        const bucket = storage.bucket(bucketName);
        const fileName = `logos/${sessionUserId}-${Date.now()}-${file.originalname}`;
        const blob = bucket.file(fileName);
        
        await blob.save(file.buffer, {
          contentType: file.mimetype,
          resumable: false,
        });
        
        logoUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      } catch (error) {
        console.error('GCS Upload Error:', error);
      }
    }

    // Update user in DB
    const updateData: any = {
      organizationName,
      username,
    };
    if (logoUrl) {
      updateData.image = logoUrl;
    }

    await this.db.update(users).set(updateData).where(eq(users.id, sessionUserId));

    return { success: true, logoUrl, message: 'Organization setup successfully' };
  }

  @Get('todos')
  async getTodos(@Req() req: any) {
    const userId = req.user.id;
    return this.db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt));
  }

  @Post('todos')
  async createTodo(@Req() req: any, @Body() body: { title: string; dueDate: string }) {
    const userId = req.user.id;
    if (!body.title || !body.dueDate) {
      throw new BadRequestException('Title and dueDate are required.');
    }
    const todoId = 'todo-' + Math.random().toString(36).substring(2, 9);
    await this.db.insert(todos).values({
      id: todoId,
      userId,
      title: body.title,
      dueDate: new Date(body.dueDate),
      isCompleted: false
    });
    return { success: true, id: todoId };
  }

  @Patch('todos/:id')
  async toggleTodo(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { isCompleted?: boolean; title?: string }
  ) {
    const userId = req.user.id;
    const updateData: any = {};
    if (body.isCompleted !== undefined) updateData.isCompleted = body.isCompleted;
    if (body.title !== undefined) updateData.title = body.title;

    await this.db
      .update(todos)
      .set(updateData)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));

    return { success: true };
  }

  @Delete('todos/:id')
  async deleteTodo(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    await this.db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));

    return { success: true };
  }
}
