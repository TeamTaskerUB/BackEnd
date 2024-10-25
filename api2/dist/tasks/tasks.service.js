"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("./schemas/task.schema");
const groupal_task_schema_1 = require("../groupal-tasks/schemas/groupal-task.schema");
const global_task_schema_1 = require("../global-task/schemas/global-task.schema");
let TasksService = class TasksService {
    constructor(taskModel, groupalTaskModel, globalTaskModel) {
        this.taskModel = taskModel;
        this.groupalTaskModel = groupalTaskModel;
        this.globalTaskModel = globalTaskModel;
    }
    async createTask(createTaskDto) {
        const { groupalTaskId, globalTaskId, ...taskData } = createTaskDto;
        const task = new this.taskModel({
            ...taskData,
        });
        const createdTask = await task.save();
        const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
        if (!groupalTask) {
            throw new common_1.NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
        }
        groupalTask.tasks.push(createdTask._id);
        await groupalTask.save();
        const globalTask = await this.globalTaskModel.findById(globalTaskId);
        if (!globalTask) {
            throw new common_1.NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
        }
        globalTask.tasks.push(createdTask._id);
        await globalTask.save();
        return createdTask;
    }
    async getTaskById(taskId) {
        const task = await this.taskModel.findById(taskId).exec();
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID "${taskId}" not found`);
        }
        return task;
    }
    async assignAssigneesToTask(taskId, assignees, userRole) {
        if (userRole !== 'PManager') {
            throw new common_1.ForbiddenException('Only Project Managers can assign assignees to tasks.');
        }
        const task = await this.taskModel.findById(taskId);
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID "${taskId}" not found`);
        }
        task.assignees.push(...assignees.map(assigneeId => new mongoose_2.Types.ObjectId(assigneeId)));
        return task.save();
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __param(1, (0, mongoose_1.InjectModel)(groupal_task_schema_1.GroupalTask.name)),
    __param(2, (0, mongoose_1.InjectModel)(global_task_schema_1.GlobalTask.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], TasksService);
//# sourceMappingURL=tasks.service.js.map