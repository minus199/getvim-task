import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { UserStorage } from './user-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    { provide: 'IAppService', useClass: AppService },
    { provide: 'IUserStorage', useClass: UserStorage },
  ],
})
export class AppModule {}
