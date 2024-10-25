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
exports.GlobalTasksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const global_task_schema_1 = require("./schemas/global-task.schema");
const groupal_task_schema_1 = require("../groupal-tasks/schemas/groupal-task.schema");
const task_schema_1 = require("../tasks/schemas/task.schema");
const user_service_1 = require("../user/user.service");
let GlobalTasksService = class GlobalTasksService {
    constructor(globalTaskModel, groupalTaskModel, taskModel, userService) {
        this.globalTaskModel = globalTaskModel;
        this.groupalTaskModel = groupalTaskModel;
        this.taskModel = taskModel;
        this.userService = userService;
    }
    async getGlobalTaskPreview(id) {
        const globalTask = await this.globalTaskModel.findById(id).exec();
        if (!globalTask) {
            throw new common_1.NotFoundException(`Global Task with ID "${id}" not found`);
        }
        const groupalTasks = await this.groupalTaskModel
            .find({ _id: { $in: globalTask.groupalTasks } })
            .select('name startDate endDate description')
            .exec();
        const tasks = await this.taskModel
            .find({ _id: { $in: globalTask.tasks } })
            .select('name startDate endDate description')
            .exec();
        return {
            ...globalTask.toObject(),
            groupalTasks,
            tasks,
        };
    }
    async createGlobalTask(createGlobalTaskDto, userId) {
        const user = await this.userService.getUserById(userId);
        if (user.role !== 'PManager') {
            throw new common_1.ForbiddenException('No tienes permisos para crear una tarea global');
        }
        const globalTask = new this.globalTaskModel({
            ...createGlobalTaskDto,
            admin: userId,
            grupalTasks: [],
            tasks: [],
        });
        return globalTask.save();
    }
};
exports.GlobalTasksService = GlobalTasksService;
exports.GlobalTasksService = GlobalTasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(global_task_schema_1.GlobalTask.name)),
    __param(1, (0, mongoose_1.InjectModel)(groupal_task_schema_1.GroupalTask.name)),
    __param(2, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        user_service_1.UserService])
], GlobalTasksService);
//# sourceMappingURL=global-task.service.js.map