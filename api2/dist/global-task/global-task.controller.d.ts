import { GlobalTasksService } from './global-task.service';
import { CreateGlobalTaskDto } from './dtos/create-global-task.dto';
import { Request } from 'express';
export declare class GlobalTasksController {
    private readonly globalTasksService;
    constructor(globalTasksService: GlobalTasksService);
    getGlobalTaskPreview(id: string): Promise<{
        groupalTasks: (import("mongoose").Document<unknown, {}, import("../groupal-tasks/schemas/groupal-task.schema").GroupalTask> & import("../groupal-tasks/schemas/groupal-task.schema").GroupalTask & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v?: number;
        })[];
        tasks: (import("mongoose").Document<unknown, {}, import("../tasks/schemas/task.schema").Task> & import("../tasks/schemas/task.schema").Task & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v?: number;
        })[];
        name: string;
        description: string;
        startDate: Date;
        endDate: Date;
        priority: string;
        comments: {
            id: import("mongoose").Types.ObjectId;
            text: string;
        }[];
        admin: import("mongoose").Types.ObjectId;
        _id: unknown;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
    }>;
    createGlobalTask(req: Request, createGlobalTaskDto: CreateGlobalTaskDto): Promise<import("./schemas/global-task.schema").GlobalTask>;
}
