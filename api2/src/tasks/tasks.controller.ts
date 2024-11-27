import { Controller, Post, Body, Param, UseGuards, NotFoundException, Get, Req, ForbiddenException, Delete } from '@nestjs/common';
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
  @Post('assign/:id')
  async assignAssigneesToTask(
    @Param('id') taskId: string,
    @Body('assignees') assignees: string[],
    @Req() req: Request
  ) {
    


    

    // Llamamos al servicio para asignar los assignees
    return this.tasksService.assignAssigneesToTask(taskId, assignees);
  }


  @UseGuards(JwtAuthGuard)
  @Post(':taskId/remove-assignee')
  async removeAssigneeFromTask(
    @Param('taskId') taskId: string, // Recibe el ID de la tarea desde los parámetros
    @Body('userId') userId: string // Recibe el userId desde el cuerpo
  ) {
    return this.tasksService.removeAssigneeFromTask(taskId, userId);
  }

  // Ruta para obtener todos los asignados a una tarea con su nombre e id
  @UseGuards(JwtAuthGuard)
  @Get(':id/assignees')
  async getTaskAssignees(@Param('id') taskId: string) {
    const assignees = await this.tasksService.getTaskAssignees(taskId);
    if (!assignees || assignees.length === 0) {
      throw new NotFoundException(`No assignees found for task with ID "${taskId}"`);
    }
    return assignees;
  }


  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTask(@Param('id') taskId: string, @Req() req: Request) {
    const user = req.user;

    // Verificar si el usuario tiene permisos (por ejemplo, si es un Project Manager)
    

    // Llamamos al servicio para eliminar la tarea
    return this.tasksService.deleteTask(taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  async completeTask(
    @Param('id') taskId: string,
    @Req() req: Request
  ) {
    return this.tasksService.completeTask(taskId);
  }

}
