import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalTask } from './schemas/global-task.schema';
import { GroupalTask } from '../groupal-tasks/schemas/groupal-task.schema';
import { Task } from '../tasks/schemas/task.schema';

@Injectable()
export class GlobalTasksService {
  constructor(
    @InjectModel(GlobalTask.name) private readonly globalTaskModel: Model<GlobalTask>,
    @InjectModel(GroupalTask.name) private readonly groupalTaskModel: Model<GroupalTask>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  async getGlobalTaskPreview(id: string) {
    // Busca la tarea global por su ID
    const globalTask = await this.globalTaskModel.findById(id).exec();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${id}" not found`);
    }

    // Obtén las tareas grupales asociadas a la tarea global
    const groupalTasks = await this.groupalTaskModel
      .find({ _id: { $in: globalTask.grupalTasks } })
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
}
