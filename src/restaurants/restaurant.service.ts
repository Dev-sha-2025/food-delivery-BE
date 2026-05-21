import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant } from './restaurant.schema';
import { CreateRestaurantDto, UpdateRestaurantDto } from './restaurant.dto';

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

  async updateRestaurant(dto: UpdateRestaurantDto) {
    const { restaurantId, ...fields } = dto;

    const updateFields: Record<string, unknown> = {};
    if (fields.restaurantName !== undefined) updateFields.restaurantName = fields.restaurantName;
    if (fields.address !== undefined) updateFields.address = fields.address;
    if (fields.latLng !== undefined) updateFields.latLng = fields.latLng;
    if (fields.isActive !== undefined) updateFields.isActive = fields.isActive;
    if (fields.fromTime !== undefined) updateFields.fromTime = fields.fromTime;
    if (fields.toTime !== undefined) updateFields.toTime = fields.toTime;

    const restaurant = await this.restaurantModel
      .findByIdAndUpdate(restaurantId, { $set: updateFields }, { new: true })
      .exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id ${restaurantId} not found`);
    }
    return restaurant;
  }
}
