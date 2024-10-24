import { Module } from '@nestjs/common';
import { GroupalTaskController } from './groupal-task.controller';
import { GroupalTaskService } from './groupal-task.service';

@Module({
  controllers: [GroupalTaskController],
  providers: [GroupalTaskService]
})
export class GroupalTaskModule {}
