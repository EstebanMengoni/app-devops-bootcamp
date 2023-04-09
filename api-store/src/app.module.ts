import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreModule } from './store/store.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:password1234@10.97.243.148:27017/?authMechanism=DEFAULT'),
    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
