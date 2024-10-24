import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GroupalTasksService } from './groupal-task.service';
import { CreateGroupalTaskDto } from './dtos/create-gruopal-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('groupal-tasks')
export class GroupalTasksController {
  constructor(private readonly groupalTasksService: GroupalTasksService) {}

  @UseGuards(JwtAuthGuard) // Protegemos la ruta con JWT
  @Post('create/:globalTaskId')
  async createGroupalTask(
    @Param('globalTaskId') globalTaskId: string, // ID de la tarea global asociada
    @Body() createGroupalTaskDto: CreateGroupalTaskDto
  ) {
    return this.groupalTasksService.createGroupalTask(globalTaskId, createGroupalTaskDto);
  }
}
