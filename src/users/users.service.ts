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
        const user = new this.userModel(userData);
        return user.save();
    }

     async updateUser(userData: Partial<User>) {
        if (!userData.email && !userData.phoneNumber) {
            throw new BadRequestException('Either email or phone number is required');
        }

        const or: any[] = [];
        if (userData.email) or.push({ email: userData.email });
        if (userData.phoneNumber) or.push({ phoneNumber: userData.phoneNumber });

        const existingUser = await this.userModel.findOne({ $or: or });

        if (existingUser) {
            Object.assign(existingUser, userData);
            return existingUser.save();
        }

        const user = new this.userModel(userData);
        return user.save();
    }
}
