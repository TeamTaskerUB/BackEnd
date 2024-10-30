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

  async getGlobalTaskById(globalTaskId: string): Promise<GlobalTask> {
    const globalTask = await this.globalTaskModel.findById(globalTaskId).exec();

    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }

    return globalTask;
  }

  async getGlobalTaskPreview(globalTaskId: string) {
    // Buscar la tarea global
    const globalTask = await this.globalTaskModel.findById(globalTaskId).lean();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }
  
    // Obtener las grupal tasks asociadas y sus tasks
    const groupalTasksWithTasks = await Promise.all(
      globalTask.groupalTasks.map(async (groupalTaskId) => {
        const groupalTask = await this.groupalTaskModel.findById(groupalTaskId).lean();
        if (!groupalTask) {
          throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
        }
  
        // Obtener las tareas asociadas a cada tarea grupal
        const tasks = await this.taskModel.find({ _id: { $in: groupalTask.tasks } }).lean();
  
        // Devolver la tarea grupal junto con sus tareas
        return {
          ...groupalTask,
          tasks,
        };
      })
    );
  
    // Devolver el objeto con el árbol completo de groupal tasks y sus tasks
    return {
      ...globalTask,
      groupalTasks: groupalTasksWithTasks, // Solo incluimos las groupal tasks con sus tasks
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
