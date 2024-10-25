import { HydratedDocument, Types } from 'mongoose';
export type GroupalTaskDocument = HydratedDocument<GroupalTask>;
export declare class GroupalTask {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    priority: string;
    comments: {
        id: Types.ObjectId;
        text: string;
    }[];
    tasks: Types.ObjectId[];
    admin: Types.ObjectId;
}
export declare const GroupalTaskSchema: import("mongoose").Schema<GroupalTask, import("mongoose").Model<GroupalTask, any, any, any, import("mongoose").Document<unknown, any, GroupalTask> & GroupalTask & {
    _id: Types.ObjectId;
} & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GroupalTask, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<GroupalTask>> & import("mongoose").FlatRecord<GroupalTask> & {
    _id: Types.ObjectId;
} & {
    __v?: number;
}>;
