import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './phonepe.controller';
import { PhonePeService } from './phonepe.service';
import { TransactionSchema } from './transaction.schema';
import { OrderSchema } from '../orders/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'Order', schema: OrderSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PhonePeService],
  exports: [PhonePeService],
})
export class PaymentModule {}