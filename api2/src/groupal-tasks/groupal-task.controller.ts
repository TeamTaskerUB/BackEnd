import { Controller, Post, Body, Param, UseGuards, Get, NotFoundException, Req, ForbiddenException } from '@nestjs/common';
import { GroupalTasksService } from './groupal-task.service';
import { CreateGroupalTaskDto } from './dtos/create-gruopal-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

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

  @UseGuards(JwtAuthGuard)
  @Get(':id/preview')
  async getGroupalTaskPreview(@Param('id') id: string) {
    const groupalTask = await this.groupalTasksService.getGroupalTaskPreview(id);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${id}" not found`);
    }
    return groupalTask;
  }


  @UseGuards(JwtAuthGuard)
  @Post(':id/assign-admin')
  async assignAdminToGroupalTask(
    @Param('id') groupalTaskId: string,
    @Body('newAdminId') newAdminId: string,
    @Req() req: Request
  ) {
    const user = req.user; // Extraemos el usuario del request (usando JwtStrategy)
    
    // Verificamos si el usuario tiene el rol de PManager
    if (user.role !== 'PManager') {
      throw new ForbiddenException('Only Project Managers can assign admins to group tasks.');
    }

    // Llamamos al servicio para asignar el nuevo admin
    return this.groupalTasksService.assignAdmin(groupalTaskId, newAdminId);
  }
}
