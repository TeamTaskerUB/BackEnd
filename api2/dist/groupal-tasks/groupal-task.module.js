"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupalTaskModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const groupal_task_controller_1 = require("./groupal-task.controller");
const groupal_task_service_1 = require("./groupal-task.service");
const groupal_task_schema_1 = require("./schemas/groupal-task.schema");
const global_task_schema_1 = require("../global-task/schemas/global-task.schema");
const task_schema_1 = require("../tasks/schemas/task.schema");
let GroupalTaskModule = class GroupalTaskModule {
};
exports.GroupalTaskModule = GroupalTaskModule;
exports.GroupalTaskModule = GroupalTaskModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: groupal_task_schema_1.GroupalTask.name, schema: groupal_task_schema_1.GroupalTaskSchema },
                { name: global_task_schema_1.GlobalTask.name, schema: global_task_schema_1.GlobalTaskSchema },
                { name: task_schema_1.Task.name, schema: task_schema_1.TaskSchema }
            ]),
        ],
        controllers: [groupal_task_controller_1.GroupalTasksController],
        providers: [groupal_task_service_1.GroupalTasksService],
    })
], GroupalTaskModule);
//# sourceMappingURL=groupal-task.module.js.map