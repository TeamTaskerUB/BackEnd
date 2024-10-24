import { Module } from '@nestjs/common';
import { GrupalTaskController } from './grupal-task.controller';
import { GrupalTaskService } from './grupal-task.service';

@Module({
  controllers: [GrupalTaskController],
  providers: [GrupalTaskService]
})
export class GrupalTaskModule {}
