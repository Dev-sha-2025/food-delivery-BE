import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
    @ApiProperty({
        description: "User ID to whom the address belongs",
        example: "USER123456",
    })
    @IsString()
    userId: string;
    @ApiPropertyOptional({
        description: "Address ID (for updates, optional)",
        example: "ADDR123456",
    })
    @IsString()
    @IsOptional()
    addressId?: string;
    @ApiProperty({
        description: "Full address details including house number and street",
        example: "No 12, 4th Street, Anna Nagar, Chennai - 600040",
    })
    @IsString()
    addressDetails: string;

    @ApiPropertyOptional({
        description: "Type of address (Home / Work / Other)",
        example: "Home",
    })
    @IsString()
    @IsOptional()
    addressType?: string;

    @ApiProperty({
        description: "Contact number of the person at delivery location",
        example: "9876543210",
    })
    @IsString()
    receiverPhoneNumber: string;

    @ApiProperty({
        description: "Name of the person receiving the order",
        example: "Rahul",
    })
    @IsString()
    receiverName: string;

    @ApiPropertyOptional({
        description: "Latitude and Longitude values in 'lat,lng' format",
        example: "13.0827,80.2707",
    })
    @IsString()
    @IsOptional()
    latlong?: string;

    @ApiPropertyOptional({
        description: "Marks the address currently selected for order",
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isChosen?: boolean;

    @ApiPropertyOptional({
        description: "Marks the address as primary default address",
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}

export class GetUserAddressDto {
    @ApiPropertyOptional({
        description: "User ID to whom the address belongs",
        example: "USER123456",
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({
        description: "Address ID (for updates, optional)",
        example: "ADDR123456",
    })
    @IsOptional()
    @IsString()
    addressId?: string;
}

export class AddressResponseDto extends CreateAddressDto {
    @ApiProperty({ description: 'Unique Address ID', example: 'usr_12345' })
    _id: string;
}
