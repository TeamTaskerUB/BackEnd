import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalTask } from './schemas/global-task.schema';
import { GroupalTask } from '../groupal-tasks/schemas/groupal-task.schema';
import { Task } from '../tasks/schemas/task.schema';
import { CreateGlobalTaskDto } from './dtos/create-global-task.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GlobalTasksService {
  
  constructor(
    @InjectModel(GlobalTask.name) private readonly globalTaskModel: Model<GlobalTask>,
    @InjectModel(GroupalTask.name) private readonly groupalTaskModel: Model<GroupalTask>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private readonly userService: UserService
  ) {}

  async getGlobalTaskPreview(id: string) {
    // Busca la tarea global por su ID
    const globalTask = await this.globalTaskModel.findById(id).exec();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${id}" not found`);
    }

    // Obtén las tareas grupales asociadas a la tarea global
    const groupalTasks = await this.groupalTaskModel
      .find({ _id: { $in: globalTask.groupalTasks } })
      .select('name startDate endDate description') // Solo devuelve los campos necesarios
      .exec();

    // Obtén las tareas normales asociadas a la tarea global
    const tasks = await this.taskModel
      .find({ _id: { $in: globalTask.tasks } })
      .select('name startDate endDate description') // Solo devuelve los campos necesarios
      .exec();

    return {
      ...globalTask.toObject(), // Devuelve toda la info de la tarea global
      groupalTasks, // Resumen de tareas grupales
      tasks, // Resumen de tareas normales
    };
  }

  async createGlobalTask(createGlobalTaskDto: CreateGlobalTaskDto, userId: string): Promise<GlobalTask> {
    // Verificar que el usuario tenga rol de PManager
    const user = await this.userService.getUserById(userId);
    

    if (user.role !== 'PManager') {
      throw new ForbiddenException('No tienes permisos para crear una tarea global');
    }

    // Crear la tarea global con los arrays vacíos de tasks y grupalTasks
    const globalTask = new this.globalTaskModel({
      ...createGlobalTaskDto,
      admin: userId, // Asignamos el userId como admin
      grupalTasks: [], // Inicializamos arrays vacíos
      tasks: [],
    });

    // Guardar en la base de datos
    return globalTask.save();
  }

  async deleteGlobalTask(globalTaskId: string, userId): Promise<void> {
    // Buscar la tarea global
    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }
  

    const user = await this.userService.getUserById(userId);
    

    if (user.role !== 'PManager') {
      throw new ForbiddenException('No tienes permisos para eliminar una tarea global');
    }

    
    // Eliminar todas las tareas grupales e individuales asociadas a la tarea global
    for (const groupalTaskId of globalTask.groupalTasks) {

      

      const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
  
      if (groupalTask) {
        // Eliminar todas las tareas individuales asociadas a la tarea grupal
        for (const taskId of groupalTask.tasks) {
          await this.taskModel.deleteOne({ _id: taskId });
        }
  
        // Eliminar la tarea grupal
        await this.groupalTaskModel.deleteOne({ _id: groupalTaskId });
      }
    }
  
    // Eliminar la tarea global
    await this.globalTaskModel.deleteOne({ _id: globalTaskId });
  }
  
  
}
