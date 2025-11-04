import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class BaseNotificationDto {
  @ApiProperty({
    description: 'Type of the notification',
    example: 'info',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Order Confirmed',
  })
  @IsString()
  heading: string;

  @ApiProperty({
    description: 'Detailed message for the user',
    example: 'Your order has been accepted and is being prepared.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Notification status',
    example: 'unread',
  })
  @IsString()
  status: string;
}

export class NotificationResponseDto extends BaseNotificationDto {
  @ApiProperty({
    description: 'Notification ID',
    example: 'NOTIF123456',
  })
  _id: string;
}

export class CreateNotificationDto extends BaseNotificationDto {
  @ApiProperty({
    description: 'Restaurant ID sending the notification',
    example: 'REST12345',
  })
  @IsString()
  restaurantId: string;

  @ApiProperty({
    description: 'User ID who receives the notification',
    example: 'USER12345',
  })
  @IsString()
  userId: string;
}

export class UpdateNotificationDto extends PartialType(BaseNotificationDto) {
  @ApiPropertyOptional({
    description: 'Restaurant ID (Only send if modifying target restaurant)',
    example: 'REST12345',
  })
  @IsOptional()
  @IsString()
  restaurantId?: string;

  @ApiPropertyOptional({
    description: 'User ID (Only send if modifying target user)',
    example: 'USER12345',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
