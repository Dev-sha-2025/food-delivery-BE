import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: "REST12345", description: "Restaurant ID linked to this menu item" })
  @IsString()
  restaurantId: string;

  @ApiProperty({ example: "Chicken Biryani", description: "Menu item name" })
  @IsString()
  name: string;

  @ApiProperty({ example: 180, description: "Item price" })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: "Non-Veg", description: "Food classification" })
  @IsOptional()
  @IsString()
  classification?: string;

  @ApiPropertyOptional({ example: "Spicy biryani with basmati rice", description: "Description of item" })
  @IsOptional()
  @IsString()
  itemDescription?: string;

  @ApiPropertyOptional({ example: "https://image-url.com/biryani.jpg", description: "Image URL" })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: "Main Course", description: "Category grouping" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: true, description: "Availability status" })
  @IsOptional()
  @IsBoolean()
  itemAvailable?: boolean;
}
export class UpdateMenuDto extends PartialType(CreateMenuDto) {}