import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupalTasksController } from './groupal-task.controller';
import { GroupalTasksService } from './groupal-task.service';
import { GroupalTask, GroupalTaskSchema } from './schemas/groupal-task.schema'; // Importa el esquema de GroupalTask
import { GlobalTask, GlobalTaskSchema } from '../global-task/schemas/global-task.schema'; // Importa el esquema de GlobalTask
import { Task, TaskSchema } from 'src/tasks/schemas/task.schema';
import { UserModule } from 'src/user/user.module';
import { GlobalTasksService } from 'src/global-task/global-task.service';
import { GlobalTaskModule } from 'src/global-task/global-task.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: GroupalTask.name, schema: GroupalTaskSchema },  // Registro de GroupalTask
      { name: GlobalTask.name, schema: GlobalTaskSchema }, 
      { name: Task.name, schema: TaskSchema }

    ]),

    GlobalTaskModule
  ],
  controllers: [GroupalTasksController],
  providers: [GroupalTasksService,
    GlobalTasksService
  ],
})
export class GroupalTaskModule {}
