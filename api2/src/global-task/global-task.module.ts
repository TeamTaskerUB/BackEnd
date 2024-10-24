import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';  // Asegúrate de que esto esté importado
import { GlobalTasksController } from './global-task.controller';
import { GlobalTasksService } from './global-task.service';
import { GlobalTask, GlobalTaskSchema } from './schemas/global-task.schema';  // Importa el esquema de GlobalTask
import { GroupalTask, GroupalTaskSchema } from '../groupal-tasks/schemas/groupal-task.schema';  // Importa el esquema de GrupalTask
import { Task, TaskSchema } from '../tasks/schemas/task.schema';  // Importa el esquema de Task
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GlobalTask.name, schema: GlobalTaskSchema },  // Esquema de GlobalTask
      { name: GroupalTask.name, schema: GroupalTaskSchema },  // Esquema de GrupalTask
      { name: Task.name, schema: TaskSchema },  // Esquema de Task
    ]),
    UserModule
  ],
  controllers: [GlobalTasksController],
  providers: [GlobalTasksService],
})
export class GlobalTaskModule {}
