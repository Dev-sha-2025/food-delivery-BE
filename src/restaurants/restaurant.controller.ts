import { Controller, Get, Post, Patch, Query, Body, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RestaurantsService } from './restaurant.service';
import { ApiOperation, ApiQuery, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateRestaurantDto, GetRestaurantDetailsDto, UpdateRestaurantDto } from './restaurant.dto';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) {}

    @Get('/list')
    @ApiOperation({ summary: 'Get all restaurants' })
    @ApiResponse({ status: 200, description: 'List of all restaurants.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async getAllRestaurants() {
        try {
            return await this.restaurantsService.getAllRestaurants();
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch restaurants');
        }
    }

    @Get('/details')
    @ApiOperation({ summary: 'Get restaurant details by restaurantId' })
    @ApiQuery({ name: 'restaurantId', required: true, type: String, description: 'ID of the restaurant' })
    @ApiResponse({ status: 200, description: 'Restaurant details.', type: GetRestaurantDetailsDto })
    @ApiResponse({ status: 400, description: 'RestaurantId is required.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async getRestaurantById(@Query('restaurantId') restaurantId: string) {
        if (!restaurantId) {
            throw new BadRequestException('RestaurantId is required');
        }
        try {
            return await this.restaurantsService.getRestaurantById(restaurantId);
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch restaurant details', error);
        }
    }

    @Post('/create')
    @ApiOperation({ summary: 'Create a new restaurant' })
    @ApiBody({ type: CreateRestaurantDto, description: 'Restaurant data' })
    @ApiResponse({ status: 201, description: 'Restaurant created.', type: GetRestaurantDetailsDto })
    @ApiResponse({ status: 400, description: 'Invalid input.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async createOrUpdate(@Body() dto: CreateRestaurantDto) {
        try {
            return await this.restaurantsService.createOrUpdateRestaurant(dto);
        } catch (error) {
            console.error('Error in create restaurant:', error);
            throw new InternalServerErrorException('Failed to create  restaurant');
        }
    }

    @Patch('/update')
    @ApiOperation({ summary: 'Update restaurant details (name, address, latLng, isActive, fromTime, toTime)' })
    @ApiBody({ type: UpdateRestaurantDto, description: 'Fields to update. Only provided fields will be updated.' })
    @ApiResponse({ status: 200, description: 'Restaurant updated successfully.', type: GetRestaurantDetailsDto })
    @ApiResponse({ status: 400, description: 'restaurantId is required.' })
    @ApiResponse({ status: 404, description: 'Restaurant not found.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async updateRestaurant(@Body() dto: UpdateRestaurantDto) {
        if (!dto.restaurantId) {
            throw new BadRequestException('restaurantId is required');
        }
        try {
            return await this.restaurantsService.updateRestaurant(dto);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error in updateRestaurant:', error);
            throw new InternalServerErrorException('Failed to update restaurant');
        }
    }
}
