import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialOffer } from './special-offer.entity';

@Injectable()
export class SpecialOfferService {
  constructor(
    @InjectRepository(SpecialOffer)
    private readonly specialOfferRepository: Repository<SpecialOffer>,
  ) {}

  async createSpecialOffer(
    name: string,
    discountPercentage: number,
  ): Promise<SpecialOffer> {
    const specialOffer = this.specialOfferRepository.create({
      name,
      discountPercentage,
    });
    return await this.specialOfferRepository.save(specialOffer);
  }
}
