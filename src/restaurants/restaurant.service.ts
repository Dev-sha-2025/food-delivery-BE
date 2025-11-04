import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant } from './restaurant.schema';
import { CreateRestaurantDto } from './restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel('Restaurant') private readonly restaurantModel: Model<Restaurant>,
  ) {}

  async getAllRestaurants() {
    return this.restaurantModel.find().sort({ createdAt: -1 }).exec();
  }

  async getRestaurantById(restaurantId: string) {
    return this.restaurantModel.findOne({ _id: restaurantId }).exec();
  }

  async createOrUpdateRestaurant(dto: CreateRestaurantDto) {
    const restaurant = new this.restaurantModel(dto);
    return restaurant.save();
  }
}
