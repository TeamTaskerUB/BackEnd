"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalTaskModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const global_task_controller_1 = require("./global-task.controller");
const global_task_service_1 = require("./global-task.service");
const global_task_schema_1 = require("./schemas/global-task.schema");
const groupal_task_schema_1 = require("../groupal-tasks/schemas/groupal-task.schema");
const task_schema_1 = require("../tasks/schemas/task.schema");
const user_module_1 = require("../user/user.module");
let GlobalTaskModule = class GlobalTaskModule {
};
exports.GlobalTaskModule = GlobalTaskModule;
exports.GlobalTaskModule = GlobalTaskModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: global_task_schema_1.GlobalTask.name, schema: global_task_schema_1.GlobalTaskSchema },
                { name: groupal_task_schema_1.GroupalTask.name, schema: groupal_task_schema_1.GroupalTaskSchema },
                { name: task_schema_1.Task.name, schema: task_schema_1.TaskSchema },
            ]),
            user_module_1.UserModule
        ],
        controllers: [global_task_controller_1.GlobalTasksController],
        providers: [global_task_service_1.GlobalTasksService],
    })
], GlobalTaskModule);
//# sourceMappingURL=global-task.module.js.map