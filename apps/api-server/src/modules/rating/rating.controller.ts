import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserRoleType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.SELLER)
  @Post()
  createRating(@Req() req: any, @Body() dto: CreateRatingDto) {
    return this.ratingService.createRating(req.user.userId, dto);
  }

  @Get('farmer/:farmerId')
  getFarmerRating(@Param('farmerId') farmerId: string) {
    return this.ratingService.getFarmerRating(farmerId);
  }

  @Get('order/:orderId')
  getOrderRatings(@Param('orderId') orderId: string) {
    return this.ratingService.getOrderRatings(orderId);
  }
}