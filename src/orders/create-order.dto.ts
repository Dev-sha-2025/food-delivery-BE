import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';


export class OrderItemInputDto {
  @ApiProperty({
    description: 'Menu item ID from Menu collection',
    example: '691210c7d617f361c1b666fb',
  })
  @IsString()
  menuId: string;

  @ApiProperty({
    description: 'Quantity of the menu item ordered',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
    
    @ApiProperty({
        description: 'Total amount for the menu item ordered',
        example: 20.5,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    totalAmount: number;
}

/* ---------------- CREATE ORDER DTO ---------------- */

export class CreateOrderDto {
  @ApiProperty({
    description: 'User ID who is placing the order',
    example: '690b61a1f500613ce0c04bea',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Restaurant ID where order is placed',
    example: '69120ddfd617f361c1b666f5',
  })
  @IsString()
  restaurantId: string;
  @ApiProperty({
    description: 'Address ID where order is placed',
    example: '69120ddfd617f361c1b666f5',
  })
  @IsString()
  addressId: string;
    
  @ApiProperty({
    description: 'Payment method used by user',
    example: 'COD',
  })
  @IsString()
  paymentMode: string;

  @ApiProperty({
    description: 'Transaction ID for the payment',
    example: 'TXN123456789',
  })
  @IsString()
  transactionId: string;

  @ApiProperty({
    description: 'List of order items',
    type: [OrderItemInputDto],
    example: [
      {
        menuId: 'MENU001',
            quantity: 2,
            totalAmount: 41.0,
      },
      {
        menuId: 'MENU002',
        quantity: 1,
        totalAmount: 20.5,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  orderItems: OrderItemInputDto[];
    
  @ApiProperty({
    description: 'Total bill amount for the order',
    example: 61.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  billAmount: number;
  @ApiProperty({
    description: 'Indicates if the payment was successful',
    example: true,
  })
  @IsBoolean()
  isPaymentSuccess: boolean;
    
  @ApiProperty({
    description: 'Delivery status of the order',
    example: 'Pending',
  })
  @IsString()
  deliveryStatus: string;
}

export class OrderItemResponseDto {
  @ApiProperty({ example: '691210c7d617f361c1b666fb' })
  menuId: string;

  @ApiProperty({ example: 'Chicken Biryani' })
  name: string;

  @ApiProperty({ example: 180 })
  price: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 360 })
  total: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'ORD123456789' })
  orderId: string;

  @ApiProperty({ example: '690b61a1f500613ce0c04bea' })
  userId: string;

  @ApiProperty({ example: 'REST123456' })
  restaurantId: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  orderItems: OrderItemResponseDto[];

  @ApiProperty({ example: 360 })
  billAmount: number;

  @ApiProperty({ example: 'COD' })
  paymentMode: string;

  @ApiProperty({ example: 'pending' })
  deliveryStatus: string;

  @ApiProperty({ example: false })
  isPaymentSuccess: boolean;

  @ApiProperty({ example: 'TXN123456789' })
  transactionId: string;


  @ApiProperty({ example: '2025-11-05T10:15:30.000Z' })
  orderDate: Date;
    
    @ApiProperty({
        description: 'Delivery address details',
        example: {
            addressId: '69120ddfd617f361c1b666f5',
            addressDetails: '123 Main St, City, Country',
            receiverName: 'John Doe',
            receiverPhoneNumber: '+1234567890',
            latlong: '12.9716,77.5946',
        },
    })
    deliveryAddress: {
        addressId: string;
        addressDetails: string;
        receiverName: string;
        receiverPhoneNumber: string;
        latlong: string;
    };
    
}


export class CreateOrderResponseDto {
  @ApiProperty({ example: 201 })
  status: number;

  @ApiProperty({ type: OrderResponseDto })
  data: OrderResponseDto;
}
export class OrdersListResponseDto {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];
}

export class UpdateOrderItemDto {
  @ApiPropertyOptional({ example: 'MENU123456' })
  @IsOptional()
  @IsString()
  menuId?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 'preparing' })
  @IsOptional()
  @IsString()
  deliveryStatus?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPaymentSuccess?: boolean;

  @ApiPropertyOptional({ type: [UpdateOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  orderItems?: UpdateOrderItemDto[];
}

