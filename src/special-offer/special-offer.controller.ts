// src/special-offer/special-offer.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { SpecialOfferService } from './special-offer.service';
import { SpecialOffer } from './special-offer.entity';

@Controller('special-offers')
export class SpecialOfferController {
  constructor(private readonly specialOfferService: SpecialOfferService) {}

  @Post()
  async createSpecialOffer(
    @Body() body: { name: string; discountPercentage: number },
  ): Promise<SpecialOffer> {
    return await this.specialOfferService.createSpecialOffer(
      body.name,
      body.discountPercentage,
    );
  }
}
