import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMenuDto,UpdateMenuDto } from './menu.dto';

@Injectable()
export class MenuService {
  constructor(@InjectModel('Menu') private menuModel: Model<any>) {}

  async createMenu(data: CreateMenuDto) {
    return await this.menuModel.create(data);
  }

  async getRestaurantMenu(restaurantId: string) {
    return await this.menuModel.find({ restaurantId, isDeleted: false,itemAvailable: true }).sort({ createdOn: -1 });
  }

  async updateMenu(itemId: string, data: UpdateMenuDto) {
    return await this.menuModel.findByIdAndUpdate(itemId, { $set: data }, { new: true });
  }

  async softDeleteMenu(itemId: string) {
    return await this.menuModel.findByIdAndUpdate(itemId, { isDeleted: true }, { new: true });
  }
}
