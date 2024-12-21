import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { SpecialOfferService } from './special-offer.service';
import { SpecialOffer } from './special-offer.entity';

@Controller('special-offers')
@ApiTags('Special Offers') // Swagger tag for this controller
export class SpecialOfferController {
  constructor(private readonly specialOfferService: SpecialOfferService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new special offer' }) // Summary of the endpoint
  @ApiBody({
    description: 'Payload to create a special offer',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Black Friday Sale' },
        discountPercentage: { type: 'number', example: 20 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Special offer created successfully',
    schema: {
      example: {
        id: 1,
        name: 'Black Friday Sale',
        discountPercentage: 20,
      },
    },
  })
  async createSpecialOffer(
    @Body() body: { name: string; discountPercentage: number },
  ): Promise<SpecialOffer> {
    return await this.specialOfferService.createSpecialOffer(
      body.name,
      body.discountPercentage,
    );
  }
}
