import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GroupalTask } from './schemas/groupal-task.schema';
import { GlobalTask } from '../global-task/schemas/global-task.schema';
import { CreateGroupalTaskDto } from './dtos/create-gruopal-task.dto';

@Injectable()
export class GroupalTasksService {
  constructor(
    @InjectModel(GroupalTask.name) private readonly groupalTaskModel: Model<GroupalTask>,
    @InjectModel(GlobalTask.name) private readonly globalTaskModel: Model<GlobalTask>,
  ) {}

  async createGroupalTask(globalTaskId: string, createGrupalTaskDto: CreateGroupalTaskDto): Promise<GroupalTask> {
    const groupalTask = new this.groupalTaskModel({
      ...createGrupalTaskDto,
    });

    const createdGroupalTask = await groupalTask.save();

    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }

    // Solo usar createdGroupalTask._id directamente
    globalTask.grupalTasks.push(createdGroupalTask._id); 
    await globalTask.save();

    return createdGroupalTask;
  }
}
