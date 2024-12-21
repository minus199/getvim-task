import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { UserStorage } from './user-storage.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, UserStorage],
})
export class AppModule {}
