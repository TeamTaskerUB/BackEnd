import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';


import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';


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
    
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})  
export class AppModule {}
