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

  async getUserRoleInGlobalTask(globalTaskId: string, userId: string): Promise<string> {
    const globalTask = await this.globalTaskModel.findById(globalTaskId).exec();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }
  
    // Verificar si el usuario es administrador de la tarea global
    if (globalTask.admin.toString() === userId) {
      return 'PManager';
    }
  
    // Verificar si el usuario es administrador de alguna tarea grupal adyacente
    for (const groupalTaskId of globalTask.groupalTasks) {
      const groupalTask = await this.groupalTaskModel.findById(groupalTaskId).exec();
      if (groupalTask && groupalTask.admin && groupalTask.admin.toString() === userId) {
        return 'GManager';
      }
    }
  
    // Verificar si el usuario está asignado en alguna tarea individual
    const tasks = await this.taskModel.find({ _id: { $in: globalTask.tasks } }).exec();
    for (const task of tasks) {
      if (task.assignees.some(assigneeId => assigneeId.toString() === userId)) {
        return 'User';
      }
    }
  
    // Si no es admin ni asignado en ninguna tarea, devolvemos 'noUser' o algún valor indicativo
    return 'noUser';
  }
  

  async getGlobalTaskById(globalTaskId: string): Promise<GlobalTask> {
    const globalTask = await this.globalTaskModel.findById(globalTaskId).exec();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }
    return globalTask;
  }

  async getGlobalTaskPreview(globalTaskId: string) {
    const globalTask = await this.globalTaskModel.findById(globalTaskId).lean();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }

    const groupalTasksWithTasks = await Promise.all(
      globalTask.groupalTasks.map(async (groupalTaskId) => {
        const groupalTask = await this.groupalTaskModel.findById(groupalTaskId).lean();
        if (!groupalTask) {
          throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
        }

        const tasks = await this.taskModel.find({ _id: { $in: groupalTask.tasks } }).lean();
        return {
          ...groupalTask,
          tasks,
        };
      })
    );

    return {
      ...globalTask,
      groupalTasks: groupalTasksWithTasks,
    };
  }

  async createGlobalTask(createGlobalTaskDto: CreateGlobalTaskDto, userId: string): Promise<GlobalTask> {
    const globalTask = new this.globalTaskModel({
      ...createGlobalTaskDto,
      admin: userId,
      grupalTasks: [],
      tasks: [],
      status: false,
    });

    return globalTask.save();
  }

  async deleteGlobalTask(globalTaskId: string): Promise<void> {
    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }

    for (const groupalTaskId of globalTask.groupalTasks) {
      const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
      if (groupalTask) {
        for (const taskId of groupalTask.tasks) {
          await this.taskModel.deleteOne({ _id: taskId });
        }
        await this.groupalTaskModel.deleteOne({ _id: groupalTaskId });
      }
    }

    await this.globalTaskModel.deleteOne({ _id: globalTaskId });
  }
}
