import { Model } from 'mongoose';
import { Task } from './schemas/task.schema';
import { GroupalTask } from '../groupal-tasks/schemas/groupal-task.schema';
import { GlobalTask } from '../global-task/schemas/global-task.schema';
import { CreateTaskDto } from './dtos/create-task.dto';
export declare class TasksService {
    private readonly taskModel;
    private readonly groupalTaskModel;
    private readonly globalTaskModel;
    constructor(taskModel: Model<Task>, groupalTaskModel: Model<GroupalTask>, globalTaskModel: Model<GlobalTask>);
    createTask(createTaskDto: CreateTaskDto): Promise<Task>;
    getTaskById(taskId: string): Promise<Task>;
    assignAssigneesToTask(taskId: string, assignees: string[], userRole: string): Promise<Task>;
}
