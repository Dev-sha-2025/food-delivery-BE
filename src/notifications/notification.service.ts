import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './notification.schema';
import { CreateNotificationDto, UpdateNotificationDto } from './notification.dto';

@Injectable()
export class NotificationService {
  constructor(@InjectModel('Notification') private notificationModel: Model<Notification>) {}

  async create(data: CreateNotificationDto) {
    return await this.notificationModel.create(data);
  }

  async getAll(restaurantId?: string, userId?: string) {
    const filter: any = { isDeleted: false };

    if (restaurantId) filter.restaurantId = restaurantId;
    if (userId) filter.userId = userId;

    return await this.notificationModel.find(filter).sort({ createdAt: -1 });
  }

  async getById(notificationId: string) {
    return await this.notificationModel.findOne({ _id: notificationId, isDeleted: false });
  }

  async update(notificationId: string, data: UpdateNotificationDto) {
    return await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { $set: data },
      { new: true }
    );
  }

  // ✅ SOFT DELETE
  async delete(notificationId: string) {
    return await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { $set: { isDeleted: true } },
      { new: true }
    );
  }
}
