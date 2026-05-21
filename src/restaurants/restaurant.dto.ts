import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_MESSAGE = 'must be a valid time in HH:MM 24 Hr format (e.g. 09:00)';

export class CreateRestaurantDto {

  @ApiProperty({ description: 'Name of the restaurant', example: 'Annapoorna Veg' })
  @IsString()
  restaurantName!: string;

  @ApiProperty({ description: 'Full address of the restaurant', example: '12, Main Road, Coimbatore' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Latitude,Longitude string', example: '10.9987,76.9883' })
  @IsOptional()
  @IsString()
  latLng?: string;

  @ApiProperty({ description: 'Whether the restaurant is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Opening time of the restaurant in HH:MM format', example: '09:00', required: false })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: `fromTime ${TIME_MESSAGE}` })
  fromTime?: string;

  @ApiProperty({ description: 'Closing time of the restaurant in HH:MM format', example: '22:00', required: false })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: `toTime ${TIME_MESSAGE}` })
  toTime?: string;
}

export class UpdateRestaurantDto {
  @ApiProperty({ description: 'Unique restaurant ID', example: '664f1a2b3c4d5e6f7a8b9c0d' })
  @IsString()
  restaurantId!: string;

  @ApiPropertyOptional({ description: 'Name of the restaurant', example: 'Annapoorna Veg' })
  @IsOptional()
  @IsString()
  restaurantName?: string;

  @ApiPropertyOptional({ description: 'Full address of the restaurant', example: '12, Main Road, Coimbatore' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Latitude,Longitude string', example: '10.9987,76.9883' })
  @IsOptional()
  @IsString()
  latLng?: string;

  @ApiPropertyOptional({ description: 'Whether the restaurant is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Opening time of the restaurant in HH:MM format', example: '09:00' })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: `fromTime ${TIME_MESSAGE}` })
  fromTime?: string;

  @ApiPropertyOptional({ description: 'Closing time of the restaurant in HH:MM format', example: '22:00' })
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: `toTime ${TIME_MESSAGE}` })
  toTime?: string;
}

export class GetRestaurantDetailsDto extends CreateRestaurantDto{
    @ApiProperty({ description: 'Unique restaurant ID', example: 'REST12345' })
    @IsString()
    _id!: string;

    @ApiPropertyOptional({ description: 'Creation timestamp' })
    createdAt?: Date;

    @ApiPropertyOptional({ description: 'Last updated timestamp' })
    updatedAt?: Date;
}
