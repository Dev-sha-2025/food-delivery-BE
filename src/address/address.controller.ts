import { Controller, Post, Body, Get, Query, BadRequestException, Delete, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { AddressResponseDto, CreateAddressDto, GetUserAddressDto, UpdateAddressDto } from './address.dto';

@ApiTags('Address')
@Controller('address')
export class AddressController {
    constructor(private readonly addressService: AddressService) {}

    @Post('/create')
    @ApiOperation({ summary: 'Create or add new address for user', description: 'Creates a new address or adds an address for the specified user.' })
    @ApiResponse({ status: 200, description: 'Address created successfully', type: AddressResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid address data' })
    async create(@Body() data: CreateAddressDto) {
        return this.addressService.createAddress(data);
    }

    @Put('update/:addressId')
    @ApiOperation({ summary: 'Update an existing address for user', description: 'Updates an existing address for the specified user.' })
    @ApiResponse({ status: 200, description: 'Address updated successfully', type: AddressResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid address data' })
    async update(@Param('addressId') addressId: string, @Body() data: CreateAddressDto) {
        if (!addressId) {
            throw new BadRequestException('addressId is required in the URL path');
        }
        if (!data.userId) {
            throw new BadRequestException('userId is required for update');
        }
        return this.addressService.updateAddress({ ...data, addressId });
    }

    @Get('/listById')
    @ApiOperation({ 
        summary: 'Get list of addresses based on userId or AddressId', 
        description: 'Retrieves a list of addresses filtered by userId or addressId. At least one of userId or addressId must be provided as a query parameter.' 
    })
    @ApiResponse({ status: 200, description: 'Address retrieved successfully', type: AddressResponseDto })
    @ApiResponse({ status: 400, description: 'userId or addressId is required' })
    async listById(@Query() query: GetUserAddressDto) {
            if (!query.userId && !query.addressId) {
                    throw new BadRequestException('userId or addressId is required');
            }
        const result = await this.addressService.getUserAddress(query.userId, query.addressId) || {};
        return result;
    }

     @Get('/lists')
    @ApiOperation({ 
        summary: 'Get list of addresses based on userId or AddressId', 
        description: 'Retrieves a list of addresses filtered by userId or addressId. At least one of userId or addressId must be provided as a query parameter.' 
    })
    @ApiResponse({ status: 200, description: 'Address retrieved successfully', type: [AddressResponseDto] })
    async list() {
        return this.addressService.getAllAddress();
    }

     @Delete(':id')
      @ApiOperation({ summary: 'Soft delete address (mark as deleted)' })
      @ApiParam({ name: 'id', description: 'Address ID', example: '673bb63b9dec04c1c089ab16' })
      @ApiResponse({ status: 200, description: 'Address soft deleted successfully' })
      softDelete(@Param('id') id: string) {
        return this.addressService.delete(id);
      }
}
