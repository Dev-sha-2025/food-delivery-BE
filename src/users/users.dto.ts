import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class GetUserDetailsDto {
  @ApiPropertyOptional({
    description: 'User phone number',
    example: '9876543210',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'test@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

    @ApiPropertyOptional({
    description: 'User Id',
    example: 'usr_12345',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class CreateUserDto {
@ApiPropertyOptional({
    description: 'User phone number',
    example: '9876543210',
})
@ValidateIf((o) => !o.email) // Only required if email is missing
@IsString({ message: 'phoneNumber must be a string' })
phoneNumber?: string;

@ValidateIf((o) => !o.email && !o.phoneNumber)
@IsString({ message: 'Either phoneNumber or email must be provided' })
_atLeastOneContactInfo?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'test@example.com',
  })
  @ValidateIf((o) => !o.phoneNumber) // Only required if phoneNumber is missing
  @IsString({ message: 'email must be a string' })
  email?: string;
   @ApiPropertyOptional({
    description: 'User first name (optional)',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name (optional)',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Country code (optional)',
    example: '+91',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;
    
}

export class UserResponseDto extends CreateUserDto {
  @ApiProperty({ description: 'Unique user ID', example: 'usr_12345' })
  _id: string;
}

export class CreateUserResponseDto {
  @ApiProperty({ example: 201 })
  status: number;

  @ApiProperty({ type: UserResponseDto })
  data: UserResponseDto;
}

// export class UserResponseDto {
//   @ApiProperty({ description: 'Unique user ID', example: 'usr_12345' })
//   userId: string;

//   @ApiPropertyOptional({ description: 'Phone number of the user', example: '9876543210' })
//   phoneNumber?: string;

//   @ApiPropertyOptional({ description: 'Email of the user', example: 'test@example.com' })
//   email?: string;

//   @ApiPropertyOptional({ description: 'First name of the user', example: 'John' })
//   firstName?: string;

//   @ApiPropertyOptional({ description: 'Last name of the user', example: 'Doe' })
//   lastName?: string;

//   @ApiPropertyOptional({ description: 'User creation timestamp', example: '2025-11-02T13:00:00Z' })
//   createdOn?: Date;
// }
