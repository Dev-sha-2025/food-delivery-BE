import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantSchema } from './restaurant.schema';
import { RestaurantsService } from './restaurant.service';
import { RestaurantsController } from './restaurant.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Restaurant', schema: RestaurantSchema }])],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
