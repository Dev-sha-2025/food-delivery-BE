import { Controller, Post, Body, Get, Param, Patch, Delete, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, NotificationResponseDto, UpdateNotificationDto } from './notification.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  create(@Body() body: CreateNotificationDto) {
    return this.notificationService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications (optionally filter by restaurantId or userId)' })
  @ApiQuery({
    name: 'restaurantId',
    required: false,
    description: 'Filter by restaurant ID',
    example: 'REST12345',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
    example: 'USER12345',
  })
  @ApiResponse({ status: 200, description: 'List of notifications returned' })
  getAll(@Query('restaurantId') restaurantId?: string, @Query('userId') userId?: string) {
    return this.notificationService.getAll(restaurantId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by notificationId ID' })
  @ApiParam({ name: 'id', description: 'Notification ID', example: '673bb63b9dec04c1c089ab16' })
  @ApiResponse({ status: 200, description: 'Notification details returned', type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  getById(@Param('id') id: string) {
    return this.notificationService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiParam({ name: 'id', description: 'Notification ID', example: '673bb63b9dec04c1c089ab16' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  update(@Param('id') id: string, @Body() body: UpdateNotificationDto) {
    return this.notificationService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete notification (mark as deleted)' })
  @ApiParam({ name: 'id', description: 'Notification ID', example: '673bb63b9dec04c1c089ab16' })
  @ApiResponse({ status: 200, description: 'Notification soft deleted successfully' })
  softDelete(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }
}
