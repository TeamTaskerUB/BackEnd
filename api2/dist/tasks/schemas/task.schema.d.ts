import { HydratedDocument, Types } from 'mongoose';
export type GroupalTaskDocument = HydratedDocument<Task>;
export declare class Task {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    priority: string;
    comments: {
        id: Types.ObjectId;
        text: string;
    }[];
    assignees: Types.ObjectId[];
}
export declare const TaskSchema: import("mongoose").Schema<Task, import("mongoose").Model<Task, any, any, any, import("mongoose").Document<unknown, any, Task> & Task & {
    _id: Types.ObjectId;
} & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Task, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Task>> & import("mongoose").FlatRecord<Task> & {
    _id: Types.ObjectId;
} & {
    __v?: number;
}>;
