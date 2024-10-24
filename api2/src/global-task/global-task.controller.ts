import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GlobalTasksService } from './global-task.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('global-tasks')
export class GlobalTasksController {
  constructor(private readonly globalTasksService: GlobalTasksService) {}

  @UseGuards(JwtAuthGuard) // Protección de ruta con JWT
  @Get(':id/preview')
  async getGlobalTaskPreview(@Param('id') id: string) {
    return this.globalTasksService.getGlobalTaskPreview(id);
  }
}
