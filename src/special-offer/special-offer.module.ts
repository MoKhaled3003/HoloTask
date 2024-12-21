import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialOffer } from './special-offer.entity';
import { SpecialOfferService } from './special-offer.service';
import { SpecialOfferController } from './special-offer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SpecialOffer])],
  providers: [SpecialOfferService],
  controllers: [SpecialOfferController],
  exports: [TypeOrmModule],
})
export class SpecialOfferModule {}
