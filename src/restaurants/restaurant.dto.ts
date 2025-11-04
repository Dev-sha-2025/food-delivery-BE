import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateRestaurantDto {

  @ApiProperty({ description: 'Name of the restaurant', example: 'Annapoorna Veg' })
  @IsString()
  restaurantName: string;

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
}

export class GetRestaurantDetailsDto extends CreateRestaurantDto{
    @ApiProperty({ description: 'Unique restaurant ID', example: 'REST12345' })
    @IsString()
    _id: string;

    @ApiPropertyOptional({ description: 'Creation timestamp' })
    createdAt?: Date;

    @ApiPropertyOptional({ description: 'Last updated timestamp' })
    updatedAt?: Date;
}
