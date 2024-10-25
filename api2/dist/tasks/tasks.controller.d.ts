import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { Request } from 'express';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    createTask(createTaskDto: CreateTaskDto): Promise<import("./schemas/task.schema").Task>;
    getTaskById(id: string): Promise<import("./schemas/task.schema").Task>;
    assignAssigneesToTask(taskId: string, assignees: string[], req: Request): Promise<import("./schemas/task.schema").Task>;
}
