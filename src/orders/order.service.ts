import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto, UpdateOrderDto } from './create-order.dto';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private orderModel: Model<any>,
        @InjectModel('Menu') private menuModel: Model<any>,
    ) { }

    async createOrder(dto: CreateOrderDto) {
        const finalItems: any[] = [];

        for (const item of dto.orderItems) {
            const menu = await this.menuModel.findById(item.menuId);
            if (!menu || menu.isDeleted) {
                throw new NotFoundException(`Menu item not found: ${item.menuId}`);
            }

            //   const itemTotal = menu.price * item.quantity;
            //   totalBill += itemTotal;

            finalItems.push({
                menuId: menu._id,
                name: menu.name,
                totalAmount: item.totalAmount,
                quantity: item.quantity,
                pricePerQuantity: menu.price,
                classification: menu.classification,
                itemDescription: menu.itemDescription,
                imageUrl: menu.imageUrl,
                category: menu.category,
            });
        }

        const order = await this.orderModel.create({
            userId: dto.userId,
            restaurantId: dto.restaurantId,
            paymentMode: dto.paymentMode,
            billAmount: dto.billAmount,
            isPaymentSuccess: dto.isPaymentSuccess,
            orderItems: finalItems,
            deliveryStatus: dto.deliveryStatus 
        });

        return order;
    }

    /* ✅ Get Orders by User */
    async getUserOrders(userId: string) {
        return this.orderModel
            .find({ userId })
            .sort({ createdAt: -1 });
    }

    /* ✅ Get Orders by Restaurant */
    async getRestaurantOrders(restaurantId: string) {
        return this.orderModel
            .find({ restaurantId })
            .sort({ createdAt: -1 });
    }

    async updateOrder(orderId: string, dto: UpdateOrderDto) {
        const order = await this.orderModel.findById(orderId);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Update items if provided
        //   if (dto.orderItems && dto.orderItems.length > 0) {
        //     // let totalBill = 0;
        //     // const updatedItems: any[] = [];

        //     // for (const item of dto.orderItems) {
        //     //   const menu = await this.menuModel.findById(item.menuId);
        //     //   if (!menu) throw new Error(`Menu not found: ${item.menuId}`);

        //     //   updatedItems.push({
        //     //     menuId: menu._id,
        //     //     name: menu.name,
        //     //     price: menu.price,
        //     //     quantity: item.quantity,
        //     //     total: itemTotal,
        //     //   });
        //     // }

        //     order.orderItems = updatedItems;
        //     order.billAmount = totalBill;
        //   }

        if (dto.deliveryStatus) order.deliveryStatus = dto.deliveryStatus;
        if (dto.isPaymentSuccess !== undefined)
            order.isPaymentSuccess = dto.isPaymentSuccess;

        await order.save();
        return order;
    }
}
