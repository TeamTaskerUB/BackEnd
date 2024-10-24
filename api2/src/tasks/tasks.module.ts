import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task, TaskSchema } from './schemas/task.schema'; // Importa el esquema de Task
import { GroupalTask, GroupalTaskSchema } from '../groupal-tasks/schemas/groupal-task.schema';
import { GlobalTask, GlobalTaskSchema } from '../global-task/schemas/global-task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },  // Asegúrate de registrar el esquema de Task
      { name: GroupalTask.name, schema: GroupalTaskSchema },  // Registrar GroupalTask
      { name: GlobalTask.name, schema: GlobalTaskSchema },  // Registrar GlobalTask
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
