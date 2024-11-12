import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GroupalTask } from './schemas/groupal-task.schema';
import { GlobalTask } from '../global-task/schemas/global-task.schema';
import { CreateGroupalTaskDto } from './dtos/create-gruopal-task.dto';
import { Task } from 'src/tasks/schemas/task.schema';
import { GlobalTasksService } from 'src/global-task/global-task.service';

@Injectable()
export class GroupalTasksService {
  constructor(
    @InjectModel(GroupalTask.name) private readonly groupalTaskModel: Model<GroupalTask>,
    @InjectModel(GlobalTask.name) private readonly globalTaskModel: Model<GlobalTask>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private readonly globalTasksService: GlobalTasksService
  ) {}

  async createGroupalTask(globalTaskId: string, createGroupalTaskDto: CreateGroupalTaskDto, userId:string): Promise<GroupalTask> {
    const groupalTask = new this.groupalTaskModel({
      ...createGroupalTaskDto,
      status: false,
    });

    const userRole = await this.globalTasksService.getUserRoleInGlobalTask(globalTaskId, userId);
    console.log(userRole);
    if (userRole !== 'PManager') {
    throw new ForbiddenException('No puedes crear una tarea grupal si ser el PM');
    }



    const createdGroupalTask = await groupalTask.save();

    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }

    globalTask.groupalTasks.push(createdGroupalTask._id);
    await globalTask.save();

    return createdGroupalTask;
  }

  async getGroupalTaskPreview(groupalTaskId: string) {
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId).lean();
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    const tasks = await this.taskModel.find({ _id: { $in: groupalTask.tasks } }).lean();
    return {
      ...groupalTask,
      tasks,
    };
  }

  async assignAdmin(groupalTaskId: string, newAdminId: string): Promise<GroupalTask> {
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    groupalTask.admin = new Types.ObjectId(newAdminId);
    await groupalTask.save();
    return groupalTask;
  }

  async deleteGroupalTask(groupalTaskId: string): Promise<void> {
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    for (const taskId of groupalTask.tasks) {
      await this.taskModel.deleteOne({ _id: taskId });
      await this.globalTaskModel.updateOne(
        { tasks: taskId },
        { $pull: { tasks: taskId } }
      );
    }

    await this.groupalTaskModel.deleteOne({ _id: groupalTaskId });
    await this.globalTaskModel.updateOne(
      { groupalTasks: groupalTaskId },
      { $pull: { groupalTasks: groupalTaskId } }
    );
  }

  async removeAdminFromGroupalTask(groupalTaskId: string): Promise<GroupalTask> {
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    groupalTask.admin = null;
    await groupalTask.save();
    return groupalTask;
  }
}
