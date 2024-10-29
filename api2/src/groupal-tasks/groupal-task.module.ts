import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupalTasksController } from './groupal-task.controller';
import { GroupalTasksService } from './groupal-task.service';
import { GroupalTask, GroupalTaskSchema } from './schemas/groupal-task.schema'; // Importa el esquema de GroupalTask
import { GlobalTask, GlobalTaskSchema } from '../global-task/schemas/global-task.schema'; // Importa el esquema de GlobalTask
import { Task, TaskSchema } from 'src/tasks/schemas/task.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: GroupalTask.name, schema: GroupalTaskSchema },  // Registro de GroupalTask
      { name: GlobalTask.name, schema: GlobalTaskSchema }, 
      { name: Task.name, schema: TaskSchema }
    ]),
  ],
  controllers: [GroupalTasksController],
  providers: [GroupalTasksService],
})
export class GroupalTaskModule {}
