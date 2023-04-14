import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreModule } from './store/store.module';
import { ConfigModule, ConfigService } from '@nestjs/config'
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('DB_URI'), // Loaded from .ENV
      })
    }),
    StoreModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}