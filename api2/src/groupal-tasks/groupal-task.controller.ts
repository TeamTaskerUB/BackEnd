import { Controller, Post, Body, Param, UseGuards, Get, NotFoundException, Req, ForbiddenException, Delete } from '@nestjs/common';
import { GroupalTasksService } from './groupal-task.service';
import { CreateGroupalTaskDto } from './dtos/create-gruopal-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('groupal-tasks')
export class GroupalTasksController {
  constructor(private readonly groupalTasksService: GroupalTasksService) {}


  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getGroupalTaskPreview(
    @Param('id') groupalTaskId: string,
    @Req() req: Request
  ) {
    const userId = req.user.userId;
    return this.groupalTasksService.getGroupalTaskPreview(userId, groupalTaskId);
  }


  @UseGuards(JwtAuthGuard) // Protegemos la ruta con JWT
  @Post('create/:globalTaskId')
  async createGroupalTask(
    @Param('globalTaskId') globalTaskId: string, // ID de la tarea global asociada
    @Body() createGroupalTaskDto: CreateGroupalTaskDto,
    @Req() req:Request
  ) {


    const userId = req.user.userId;

    return this.groupalTasksService.createGroupalTask(globalTaskId, createGroupalTaskDto, userId);
  }



  @UseGuards(JwtAuthGuard)
  @Post('assign-admin/:id')
  async assignAdminToGroupalTask(
    @Param('id') groupalTaskId: string,
    @Body('newAdminId') newAdminId: string,
    @Req() req: Request
  ) {
    const user = req.user; // Extraemos el usuario del request (usando JwtStrategy)

    console.log(user)
    
    // Verificamos si el usuario tiene el rol de PManager
    if (user.role !== 'PManager') {
      throw new ForbiddenException('Only Project Managers can assign admins to group tasks.');
    }

    // Llamamos al servicio para asignar el nuevo admin
    return this.groupalTasksService.assignAdmin(groupalTaskId, newAdminId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteGroupalTask(@Param('id') groupalTaskId: string, @Req() req: Request) {
    const user = req.user;
    console.log(user.role)

    // Verificar si el usuario tiene permisos (debe ser Project Manager)
    if (user.role !== 'PManager') {
      throw new ForbiddenException('Only Project Managers can delete group tasks.');
    }

    // Llamamos al servicio para eliminar la tarea grupal y sus tareas asociadas
    return this.groupalTasksService.deleteGroupalTask(groupalTaskId);
  }


  @UseGuards(JwtAuthGuard)
  @Post('remove-admin/:id')
  async removeAdminFromGroupalTask(
    @Param('id') groupalTaskId: string,
    @Req() req: Request
  ) {
    const user = req.user;

    // Verificar si el usuario tiene permisos (debe ser Project Manager)
    if (user.role !== 'PManager') {
      throw new ForbiddenException('Only Project Managers can remove admins from group tasks.');
    }

    // Llamamos al servicio para eliminar el admin de la tarea grupal
    return this.groupalTasksService.removeAdminFromGroupalTask(groupalTaskId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/add-member')
  async addMemberToGroupalTask(
    @Param('id') groupalTaskId: string,
    @Body('userId') userId: string,
    @Req() req: Request,
  ) {
    // Usuario que realiza la solicitud
    return this.groupalTasksService.addMemberToGroupalTask(groupalTaskId, userId);
  }

  // Ruta para eliminar un miembro de una Groupal Task
  @UseGuards(JwtAuthGuard)
  @Delete(':id/remove-member')
  async removeMemberFromGroupalTask(
    @Param('id') groupalTaskId: string,
    @Body('userId') userId: string,
    @Req() req: Request,
  ) {
    const requesterId = req.user.userId; // Usuario que realiza la solicitud
    return this.groupalTasksService.removeMemberFromGroupalTask(groupalTaskId, userId, requesterId);
  }
 
  
}
