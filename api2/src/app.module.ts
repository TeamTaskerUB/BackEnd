import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { GlobalTaskModule } from './global-task/global-task.module';
import { GroupalTaskModule } from './groupal-tasks/groupal-task.module';
import { RoleMiddleware } from './middlewares/role.middleware'; // Importamos el middleware

@Module({
  imports: [ 
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles globalmente
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Importamos ConfigModule para poder usar ConfigService
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODBURI'), // Obtenemos la URI desde el archivo .env
      }),
    }),
    UserModule,
    AuthModule,
    TasksModule,
    GlobalTaskModule,
    GroupalTaskModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicamos el middleware de Role a todas las rutas de Tasks y GroupalTasks
    consumer
      .apply(RoleMiddleware)
      .forRoutes(
        { path: 'tasks', method: RequestMethod.ALL },  // Todas las rutas de tasks
        { path: 'groupal-tasks', method: RequestMethod.ALL }  // Todas las rutas de groupal tasks
      );
  }
}
