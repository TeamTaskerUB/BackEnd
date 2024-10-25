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
exports.GroupalTasksController = void 0;
const common_1 = require("@nestjs/common");
const groupal_task_service_1 = require("./groupal-task.service");
const create_gruopal_task_dto_1 = require("./dtos/create-gruopal-task.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let GroupalTasksController = class GroupalTasksController {
    constructor(groupalTasksService) {
        this.groupalTasksService = groupalTasksService;
    }
    async createGroupalTask(globalTaskId, createGroupalTaskDto) {
        return this.groupalTasksService.createGroupalTask(globalTaskId, createGroupalTaskDto);
    }
    async getGroupalTaskPreview(id) {
        const groupalTask = await this.groupalTasksService.getGroupalTaskPreview(id);
        if (!groupalTask) {
            throw new common_1.NotFoundException(`Groupal Task with ID "${id}" not found`);
        }
        return groupalTask;
    }
    async assignAdminToGroupalTask(groupalTaskId, newAdminId, req) {
        const user = req.user;
        if (user.role !== 'PManager') {
            throw new common_1.ForbiddenException('Only Project Managers can assign admins to group tasks.');
        }
        return this.groupalTasksService.assignAdmin(groupalTaskId, newAdminId);
    }
};
exports.GroupalTasksController = GroupalTasksController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('create/:globalTaskId'),
    __param(0, (0, common_1.Param)('globalTaskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_gruopal_task_dto_1.CreateGroupalTaskDto]),
    __metadata("design:returntype", Promise)
], GroupalTasksController.prototype, "createGroupalTask", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/preview'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupalTasksController.prototype, "getGroupalTaskPreview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/assign-admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('newAdminId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GroupalTasksController.prototype, "assignAdminToGroupalTask", null);
exports.GroupalTasksController = GroupalTasksController = __decorate([
    (0, common_1.Controller)('groupal-tasks'),
    __metadata("design:paramtypes", [groupal_task_service_1.GroupalTasksService])
], GroupalTasksController);
//# sourceMappingURL=groupal-task.controller.js.map