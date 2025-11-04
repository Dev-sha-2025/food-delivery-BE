import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto,UpdateMenuDto } from './menu.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: "Create menu item" })
  @ApiResponse({ status: 201, description: "Menu item created successfully" })
  @ApiBody({ type: CreateMenuDto })
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.createMenu(dto);
  }

  @Get(':restaurantId')
  @ApiOperation({ summary: "Get all menu items of a restaurant" })
  @ApiParam({ name: "restaurantId", example: "REST12345" })
  @ApiResponse({ status: 200, description: "List of menu items returned" })
  getAll(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getRestaurantMenu(restaurantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update menu item" })
  @ApiParam({ name: "id", example: "673bb63b9dec04c1c089ab16" })
  @ApiBody({ type: UpdateMenuDto })
  @ApiResponse({ status: 200, description: "Menu item updated successfully" })
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.updateMenu(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: "Soft delete menu item" })
  @ApiParam({ name: "id", example: "673bb63b9dec04c1c089ab16" })
  @ApiResponse({ status: 200, description: "Menu item marked as deleted" })
  softDelete(@Param('id') id: string) {
    return this.menuService.softDeleteMenu(id);
  }
}
