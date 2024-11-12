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

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteGlobalTask( @Req() req: Request) {
    const user = req.user;

    const globalTaskId = req.body.globalTaskId || req.query.globalTaskId || req.params.globalTaskId;

    const userId = req.user.userId;
    
    // Llamamos al servicio para eliminar la tarea global y sus tareas grupales e individuales asociadas
    return this.globalTasksService.deleteGlobalTask(globalTaskId, userId);
  }
}
