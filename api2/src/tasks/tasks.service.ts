import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { groupalTaskId, globalTaskId, ...taskData } = createTaskDto;

    // Crear la nueva tarea normal
    const task = new this.taskModel({
      ...taskData,
    });

    const createdTask = await task.save();

    // Buscar la tarea grupal por su ID
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    // Añadir el ID de la tarea normal a la tarea grupal
    groupalTask.tasks.push(createdTask._id);
    await groupalTask.save();

    // Buscar la tarea global por su ID
    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }

    // Añadir el ID de la tarea normal al array de tareas en la tarea global
    globalTask.tasks.push(createdTask._id);
    await globalTask.save();

    return createdTask;
  }

  async getTaskById(taskId: string): Promise<Task> {
    // Buscar la tarea por su ID
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }
    return task;
  }

  async assignAssigneesToTask(taskId: string, assignees: string[], userRole: string): Promise<Task> {
    // Verificar si el rol del usuario es 'PManager'
    if (userRole !== 'PManager') {
      throw new ForbiddenException('Only Project Managers can assign assignees to tasks.');
    }

    // Buscar la tarea por su ID
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }

    // Convertir cada ID en ObjectId y asignarlo al array de assignees
    task.assignees.push(...assignees.map(assigneeId => new Types.ObjectId(assigneeId)));

    // Guardar la tarea actualizada
    return task.save();
  }
}
