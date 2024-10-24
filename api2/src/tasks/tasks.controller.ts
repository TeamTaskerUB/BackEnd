import { Controller, Post, Body, Param, UseGuards, NotFoundException, Get, Req, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(createTaskDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    const task = await this.tasksService.getTaskById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/assign-assignees')
  async assignAssigneesToTask(
    @Param('id') taskId: string,
    @Body('assignees') assignees: string[],
    @Req() req: Request
  ) {
    const user = req.user; // Obtenemos el usuario desde el JWT

    // Verificar si el usuario es 'PManager'
    if (user.role !== 'PManager') {
      throw new ForbiddenException('Only Project Managers can assign assignees to tasks.');
    }

    // Llamamos al servicio para asignar los assignees
    return this.tasksService.assignAssigneesToTask(taskId, assignees, user.role);
  }
}
