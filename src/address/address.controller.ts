import { Controller, Post, Body, Get, Query, BadRequestException, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { AddressResponseDto, CreateAddressDto, GetUserAddressDto } from './address.dto';

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
        return this.addressService.getUserAddress(query.userId, query.addressId);
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
