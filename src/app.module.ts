import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/database';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions) ,UserModule, AuthModule, PostModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
