import { Module } from '@nestjs/common';
import { GlobalTaskController } from './global-task.controller';
import { GlobalTaskService } from './global-task.service';

@Module({
  controllers: [GlobalTaskController],
  providers: [GlobalTaskService]
})
export class GlobalTaskModule {}
