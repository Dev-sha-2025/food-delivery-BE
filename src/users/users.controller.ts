import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto, CreateUserResponseDto, GetUserDetailsDto, UserResponseDto } from './users.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/list')
    @ApiOperation({ summary: 'Get all users (latest first)' })
    @ApiResponse({ status: 200, description: 'List of users', type: [CreateUserDto] })
    async getAllUsers() {
        const users = await this.usersService.getAllUsers();
        return { status: 200, data: users };
    }

    @Get('/details')
    @ApiOperation({ summary: 'Get user details by phone or email' })
    @ApiQuery({ name: 'phoneNumber', required: false, type: String })
    @ApiQuery({ name: 'email', required: false, type: String })
    @ApiQuery({ name: 'userId', required: false, type: String })
    @ApiResponse({ status: 200, description: 'User details', type: CreateUserDto })
    @ApiResponse({ status: 400, description: 'phoneNumber or email is required' })
    async getUserDetails(@Query() query: GetUserDetailsDto) {
        const { phoneNumber, email,userId } = query;

        if (!phoneNumber && !email && !userId) {
            throw new BadRequestException('phoneNumber or email or userId is required');
        }

        const user = await this.usersService.getUserDetails({ phoneNumber, email,userId });
        return { status: 200, data: user };
    }

    @Post('/create')
    @ApiOperation({ summary: 'Create or update user (if exists)' })
    @ApiResponse({ status: 201, description: 'User created or updated', type: CreateUserResponseDto })
    @ApiResponse({ status: 400, description: 'phoneNumber or email is required' })
    async createUser(@Body() userInput: CreateUserDto) {
        if (!userInput || (!userInput.phoneNumber && !userInput.email)) {
            throw new BadRequestException('phoneNumber or email is required');
        }

        const user = await this.usersService.createUser(userInput);
        return { status: 201, data: user };
    }
}
