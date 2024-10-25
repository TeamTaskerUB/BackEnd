export declare class CreateGlobalTaskDto {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    priority: string;
    comments?: Array<{
        id: string;
        text: string;
    }>;
    grupalTasks?: string[];
    admin: string;
    tasks?: string[];
}
