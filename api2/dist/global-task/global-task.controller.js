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
exports.GlobalTasksController = void 0;
const common_1 = require("@nestjs/common");
const global_task_service_1 = require("./global-task.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_global_task_dto_1 = require("./dtos/create-global-task.dto");
let GlobalTasksController = class GlobalTasksController {
    constructor(globalTasksService) {
        this.globalTasksService = globalTasksService;
    }
    async getGlobalTaskPreview(id) {
        return this.globalTasksService.getGlobalTaskPreview(id);
    }
    async createGlobalTask(req, createGlobalTaskDto) {
        const user = req.user;
        return this.globalTasksService.createGlobalTask(createGlobalTaskDto, user.userId);
    }
};
exports.GlobalTasksController = GlobalTasksController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/preview'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GlobalTasksController.prototype, "getGlobalTaskPreview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_global_task_dto_1.CreateGlobalTaskDto]),
    __metadata("design:returntype", Promise)
], GlobalTasksController.prototype, "createGlobalTask", null);
exports.GlobalTasksController = GlobalTasksController = __decorate([
    (0, common_1.Controller)('global-tasks'),
    __metadata("design:paramtypes", [global_task_service_1.GlobalTasksService])
], GlobalTasksController);
//# sourceMappingURL=global-task.controller.js.map