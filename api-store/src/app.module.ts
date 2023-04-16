import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreModule } from './store/store.module';

const username = process.env.MONGO_USR || 'myusername';
const password = process.env.MONGO_PSSWD || 'mypassword';
const serviceUri = process.env.DB_URI || 'myservice';

//`mongodb://${username}:${password}@${serviceUri}:27017/store`

@Module({
  imports: [
    MongooseModule.forRoot('',{
      uri:`mongodb://${username}:${password}@${serviceUri}:27017/`,
      dbName:'store'
    }),
    StoreModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}