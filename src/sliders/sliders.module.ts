import { FilesModule } from 'src/files/files.module';
import { Module } from '@nestjs/common';
import { Slider } from './entities/slider.entity';
import { SlidersController } from './sliders.controller';
import { SlidersService } from './sliders.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Slider]), FilesModule],
  controllers: [SlidersController],
  providers: [SlidersService],
})
export class SlidersModule {}
