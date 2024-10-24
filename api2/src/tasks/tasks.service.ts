import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema';
import { GroupalTask } from '../groupal-tasks/schemas/groupal-task.schema';
import { GlobalTask } from '../global-task/schemas/global-task.schema';
import { CreateTaskDto } from './dtos/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(GroupalTask.name) private readonly groupalTaskModel: Model<GroupalTask>,
    @InjectModel(GlobalTask.name) private readonly globalTaskModel: Model<GlobalTask>,
  ) {}

  async createTask(groupalTaskId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    // Crear la tarea normal
    const task = new this.taskModel({
      ...createTaskDto,
    });

    const createdTask = await task.save();

    // Buscar la tarea grupal y agregar el ID de la nueva tarea al array de tasks
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    groupalTask.tasks.push(createdTask._id); // Añadir el ID de la tarea normal a la tarea grupal
    await groupalTask.save();

    // También actualizamos la tarea global que contiene esta tarea grupal
    const globalTask = await this.globalTaskModel.findOne({ grupalTasks: groupalTaskId });
    if (!globalTask) {
      throw new NotFoundException(`Global Task not found for Groupal Task with ID "${groupalTaskId}"`);
    }

    globalTask.tasks.push(createdTask._id); // Añadir el ID de la tarea normal a la tarea global
    await globalTask.save();

    return createdTask;
  }
}
