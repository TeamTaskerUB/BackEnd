import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GlobalTasksService } from './global-task.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateGlobalTaskDto } from './dtos/create-global-task.dto';
import { Request } from 'express';

@Controller('global-tasks')

export class GlobalTasksController {
  constructor(private readonly globalTasksService: GlobalTasksService) {}

  @UseGuards(JwtAuthGuard) // Protección de ruta con JWT
  @Get(':id')
  async getGlobalTaskPreview(@Param('id') id: string, @Req() req: Request) {

    

    const userId = req.user.userId;
    
    return this.globalTasksService.getGlobalTaskPreview(userId, id);
  }

  @UseGuards(JwtAuthGuard) // Proteger con JWT
  @Post('create')
  async createGlobalTask(
    @Req() req: Request, // Obtener el token del usuario
    @Body() createGlobalTaskDto: CreateGlobalTaskDto
  ) {
    const user = req.user;
    // Llamamos al servicio para crear la tarea global
    return this.globalTasksService.createGlobalTask(createGlobalTaskDto, user.userId);
  }

  @UseGuards(JwtAuthGuard) // Protección con JWT
  @Get(':id/groupal-tasks')
  async getGroupalTasksByGlobalTaskId(
    @Param('id') globalTaskId: string,
    @Req() req: Request,
  ) {
    const userId = req.user.userId; // Usuario autenticado
    return this.globalTasksService.getGroupalTasksByGlobalTaskId(userId, globalTaskId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteGlobalTask( @Req() req: Request) {
    const user = req.user;

    const globalTaskId = req.body.globalTaskId || req.query.globalTaskId || req.params.globalTaskId;

    const userId = req.user.userId;
    
    // Llamamos al servicio para eliminar la tarea global y sus tareas grupales e individuales asociadas
    return this.globalTasksService.deleteGlobalTask(globalTaskId, userId);
  }


  @UseGuards(JwtAuthGuard) // Protección de ruta con JWT
  @Get('user-tasks/:id')
  async getUserGlobalTasks(@Param('id') id: string ,@Req() req: Request) {
    const userId = req.user.userId;
    console.log(req.user);
    return this.globalTasksService.getUserGlobalTasks(userId);
  
  }

   // Ruta para agregar un miembro a una Global Task
   @UseGuards(JwtAuthGuard)
   @Post(':id/add-member')
   async addMemberToGlobalTask(
     @Param('id') globalTaskId: string,
     @Body('userId') userId: string,
     @Req() req: Request,
   ) {
     const requesterId = req.user.userId; // Usuario que realiza la solicitud
     return this.globalTasksService.addMemberToGlobalTask(globalTaskId, userId, requesterId);
   }
 
   // Ruta para eliminar un miembro de una Global Task
   @UseGuards(JwtAuthGuard)
   @Delete(':id/remove-member')
   async removeMemberFromGlobalTask(
     @Param('id') globalTaskId: string,
     @Body('userId') userId: string,
     @Req() req: Request,
   ) {
     const requesterId = req.user.userId; // Usuario que realiza la solicitud
     return this.globalTasksService.removeMemberFromGlobalTask(globalTaskId, userId, requesterId);
   }
  
}
