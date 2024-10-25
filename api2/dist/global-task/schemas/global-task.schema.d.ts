import { Document, Types } from 'mongoose';
export declare class GlobalTask extends Document {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    priority: string;
    comments: {
        id: Types.ObjectId;
        text: string;
    }[];
    groupalTasks: Types.ObjectId[];
    admin: Types.ObjectId;
    tasks: Types.ObjectId[];
}
export declare const GlobalTaskSchema: import("mongoose").Schema<GlobalTask, import("mongoose").Model<GlobalTask, any, any, any, Document<unknown, any, GlobalTask> & GlobalTask & Required<{
    _id: unknown;
}> & {
    __v?: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GlobalTask, Document<unknown, {}, import("mongoose").FlatRecord<GlobalTask>> & import("mongoose").FlatRecord<GlobalTask> & Required<{
    _id: unknown;
}> & {
    __v?: number;
}>;
