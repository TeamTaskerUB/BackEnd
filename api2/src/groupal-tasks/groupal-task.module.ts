import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupalTasksController } from './groupal-task.controller';
import { GroupalTasksService } from './groupal-task.service';
import { GroupalTask, GroupalTaskSchema } from './schemas/groupal-task.schema'; // Importa el esquema de GroupalTask
import { GlobalTask, GlobalTaskSchema } from '../global-task/schemas/global-task.schema'; // Importa el esquema de GlobalTask

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroupalTask.name, schema: GroupalTaskSchema },  // Registro de GroupalTask
      { name: GlobalTask.name, schema: GlobalTaskSchema },  // Registro de GlobalTask
    ]),
  ],
  controllers: [GroupalTasksController],
  providers: [GroupalTasksService],
})
export class GroupalTaskModule {}
