import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { Store } from './entities/store.entity';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Store]), JwtModule],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
