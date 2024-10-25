import { GroupalTasksService } from './groupal-task.service';
import { CreateGroupalTaskDto } from './dtos/create-gruopal-task.dto';
import { Request } from 'express';
export declare class GroupalTasksController {
    private readonly groupalTasksService;
    constructor(groupalTasksService: GroupalTasksService);
    createGroupalTask(globalTaskId: string, createGroupalTaskDto: CreateGroupalTaskDto): Promise<import("./schemas/groupal-task.schema").GroupalTask>;
    getGroupalTaskPreview(id: string): Promise<{
        groupalTask: import("./schemas/groupal-task.schema").GroupalTask & {
            _id: import("mongoose").Types.ObjectId;
        };
        tasksPreview: (import("mongoose").Document<unknown, {}, import("../tasks/schemas/task.schema").Task> & import("../tasks/schemas/task.schema").Task & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v?: number;
        })[];
    }>;
    assignAdminToGroupalTask(groupalTaskId: string, newAdminId: string, req: Request): Promise<import("./schemas/groupal-task.schema").GroupalTask>;
}
