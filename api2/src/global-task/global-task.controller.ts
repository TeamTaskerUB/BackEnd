import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GlobalTasksService } from './global-task.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateGlobalTaskDto } from './dtos/create-global-task.dto';
import { Request } from 'express';

@Controller('global-tasks')
export class GlobalTasksController {
  constructor(private readonly globalTasksService: GlobalTasksService) {}

  @UseGuards(JwtAuthGuard) // Protección de ruta con JWT
  @Get(':id/preview')
  async getGlobalTaskPreview(@Param('id') id: string) {
    return this.globalTasksService.getGlobalTaskPreview(id);
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
}
