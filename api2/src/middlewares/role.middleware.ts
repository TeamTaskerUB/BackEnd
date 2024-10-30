// middlewares/role.middleware.ts
import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { GlobalTasksService } from '../global-task/global-task.service'; // Asegúrate de importar GlobalTasksService

@Injectable()
export class RoleMiddleware implements NestMiddleware {
  constructor(
    private readonly globalTasksService: GlobalTasksService, // Inyectamos el servicio de Global Tasks
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.userId; // Obtenemos el userId del JWT validado
    const globalTaskId = req.body.globalTaskId || req.query.globalTaskId || req.params.globalTaskId;

    if (!globalTaskId) {
      throw new NotFoundException('No global task ID provided');
    }

    // Usamos el nuevo método para obtener el rol del usuario en la tarea global
    const userRole = await this.globalTasksService.getUserRoleInGlobalTask(globalTaskId, userId);

    // Asignamos el rol obtenido al req.user
    req.user.role = userRole;

    next(); // Continuamos con la solicitud
  }
}
