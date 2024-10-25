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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupalTaskSchema = exports.GroupalTask = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let GroupalTask = class GroupalTask {
};
exports.GroupalTask = GroupalTask;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GroupalTask.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GroupalTask.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], GroupalTask.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], GroupalTask.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GroupalTask.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ id: { type: mongoose_2.Types.ObjectId, ref: 'User' }, text: { type: String } }],
        default: [],
    }),
    __metadata("design:type", Array)
], GroupalTask.prototype, "comments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Task' }], default: [] }),
    __metadata("design:type", Array)
], GroupalTask.prototype, "tasks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], GroupalTask.prototype, "admin", void 0);
exports.GroupalTask = GroupalTask = __decorate([
    (0, mongoose_1.Schema)()
], GroupalTask);
exports.GroupalTaskSchema = mongoose_1.SchemaFactory.createForClass(GroupalTask);
//# sourceMappingURL=groupal-task.schema.js.map