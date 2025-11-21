import { Controller, Post, Body, Get, Query, BadRequestException, Delete, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, CreateOrderResponseDto, OrderResponseDto, OrdersListResponseDto, UpdateOrderDto } from './create-order.dto';
import { AddressResponseDto } from 'src/address/address.dto';
@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({
    status: 201,
    description: 'Order successfully created',
    type: OrderResponseDto,
  })
  create(@Body() dto: CreateOrderDto) {
        return this.orderService.createOrder(dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({
    status: 200,
    description: 'List of user orders',
    type: OrdersListResponseDto,
  })
  getByUser(@Param('userId') userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get restaurant orders' })
  @ApiResponse({
    status: 200,
    description: 'List of restaurant orders',
    type: OrdersListResponseDto,
  })
  getByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.orderService.getRestaurantOrders(restaurantId);
  }
    
    @Patch(':orderId')
    @ApiOperation({ summary: 'Update an existing order' })
    @ApiParam({ name: 'orderId', type: String, description: 'Order ID' })
    @ApiResponse({
        status: 200,
        description: 'Order successfully updated',
        type: OrderResponseDto,
    })
    updateOrder(
        @Param('orderId') orderId: string,
        @Body() dto: UpdateOrderDto
    ) {
        return this.orderService.updateOrder(orderId, dto);
    }
}
