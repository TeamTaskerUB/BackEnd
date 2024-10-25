import { Model } from 'mongoose';
import { GlobalTask } from './schemas/global-task.schema';
import { GroupalTask } from '../groupal-tasks/schemas/groupal-task.schema';
import { Task } from '../tasks/schemas/task.schema';
import { CreateGlobalTaskDto } from './dtos/create-global-task.dto';
import { UserService } from 'src/user/user.service';
export declare class GlobalTasksService {
    private readonly globalTaskModel;
    private readonly groupalTaskModel;
    private readonly taskModel;
    private readonly userService;
    constructor(globalTaskModel: Model<GlobalTask>, groupalTaskModel: Model<GroupalTask>, taskModel: Model<Task>, userService: UserService);
    getGlobalTaskPreview(id: string): Promise<{
        groupalTasks: (import("mongoose").Document<unknown, {}, GroupalTask> & GroupalTask & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v?: number;
        })[];
        tasks: (import("mongoose").Document<unknown, {}, Task> & Task & {
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
    createGlobalTask(createGlobalTaskDto: CreateGlobalTaskDto, userId: string): Promise<GlobalTask>;
}
