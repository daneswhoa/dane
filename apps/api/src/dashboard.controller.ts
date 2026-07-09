import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Req, Inject, Get, Patch, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { users, todos, organizations } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { SessionGuard } from './auth/auth.guard';
import { DATABASE_CONNECTION } from './db/database.module';
import { R2Service } from './r2/r2.service';

@Controller('dashboard')
@UseGuards(SessionGuard)
export class DashboardController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly r2Service: R2Service
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
    if (file) {
      try {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `logos/${sessionUserId}-${Date.now()}-${safeName}`;
        logoUrl = await this.r2Service.uploadFile(file.buffer, fileName, file.mimetype);
      } catch (error) {
        console.error('R2 Upload Error:', error);
      }
    }

    // Check if organization name is already taken
    const existingOrg = await this.db.select().from(organizations).where(eq(organizations.name, organizationName.trim())).limit(1);
    if (existingOrg.length > 0) {
      throw new BadRequestException('An organization with this name already exists.');
    }

    const orgId = 'org-' + Math.random().toString(36).substring(2, 9);
    await this.db.insert(organizations).values({
      id: orgId,
      name: organizationName.trim(),
      logoUrl: logoUrl || null,
    });

    // Update user in DB
    const updateData: any = {
      organizationId: orgId,
      organizationName,
      username,
    };
    if (logoUrl) {
      updateData.image = logoUrl;
    }

    await this.db.update(users).set(updateData).where(eq(users.id, sessionUserId));

    return { success: true, logoUrl, message: 'Organization setup successfully' };
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    const userExist = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userExist.length === 0) {
      throw new BadRequestException('User not found.');
    }
    const user = userExist[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationName: user.organizationName,
      username: user.username,
      image: user.image,
      permissions: user.permissions || null,
    };
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
