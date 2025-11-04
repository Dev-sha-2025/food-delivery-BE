import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressSchema } from './address.schema';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Address', schema: AddressSchema }]),
  ],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
