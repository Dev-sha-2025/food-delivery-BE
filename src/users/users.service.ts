import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async getAllUsers() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

    async getUserDetails(data: { phoneNumber?: string; email?: string, userId?: string }) {
        if (data.userId) {
            const getUserById = await this.userModel.findOne({ _id: data.userId });
            if (!getUserById) {
                throw new HttpException('User not found for this userId', 404);
            }
            return getUserById;
        }
        const filter = data.phoneNumber
            ? { phoneNumber: data.phoneNumber }
            : { email: data.email };
        let user = await this.userModel.findOne(filter);
        if (!user) {
            user = new this.userModel(filter);
            await user.save();
        }
        return user;
    }
    async createUser(userData: Partial<User>) {
        const existingUser = await this.userModel.findOne({
            $or: [
                { email: userData.email },
                { phoneNumber: userData.phoneNumber }
            ]
        });
        if (existingUser) {
            throw new BadRequestException('User with this email or phone number already exists');
        }
        const user = new this.userModel(userData);
        return user.save();
    }
}
