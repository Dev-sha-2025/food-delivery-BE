import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address } from './address.schema';
import { CreateAddressDto } from './address.dto';

@Injectable()
export class AddressService {
    constructor(@InjectModel('Address') private addressModel: Model<Address>) { }

    async createAddress(data: CreateAddressDto) {
        if (data.addressId) {
            const { addressId, ...updateData } = data; // remove addressId from update body
            return await this.addressModel.findByIdAndUpdate(
                { _id: addressId },
                { $set: updateData }
            );
        }
        return await this.addressModel.create(data);
    }

    async getUserAddress(userId?: string, addressId?: string) {
        const filter: any = {};
        if (addressId) {
            filter._id = addressId;
        }
        if (userId) {
            filter.userId = userId;
        }
        return await this.addressModel
            .findOne(filter);
    }

    async getAllAddress() {

        const filter: any = { isDeleted: false };
         
        return await this.addressModel
            .find(filter).sort({ createdAt: -1 })
            .exec();
    }
    
    async delete(addressId: string) {
        return await this.addressModel.findByIdAndUpdate(
            addressId,
            { $set: { isDeleted: true } },
            { new: true }
        );
    }
}