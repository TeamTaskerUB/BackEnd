import { Model, Types } from 'mongoose';
import { GroupalTask } from './schemas/groupal-task.schema';
import { GlobalTask } from '../global-task/schemas/global-task.schema';
import { CreateGroupalTaskDto } from './dtos/create-gruopal-task.dto';
import { Task } from 'src/tasks/schemas/task.schema';
export declare class GroupalTasksService {
    private readonly groupalTaskModel;
    private readonly globalTaskModel;
    private readonly taskModel;
    constructor(groupalTaskModel: Model<GroupalTask>, globalTaskModel: Model<GlobalTask>, taskModel: Model<Task>);
    createGroupalTask(globalTaskId: string, createGroupalTaskDto: CreateGroupalTaskDto): Promise<GroupalTask>;
    getGroupalTaskPreview(groupalTaskId: string): Promise<{
        groupalTask: GroupalTask & {
            _id: Types.ObjectId;
        };
        tasksPreview: (import("mongoose").Document<unknown, {}, Task> & Task & {
            _id: Types.ObjectId;
        } & {
            __v?: number;
        })[];
    }>;
    assignAdmin(groupalTaskId: string, newAdminId: string): Promise<GroupalTask>;
}
