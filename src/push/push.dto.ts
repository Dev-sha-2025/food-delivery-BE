import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class PushKeysDto {
  @ApiProperty({ example: 'BNc...' })
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @ApiProperty({ example: 'xY8...' })
  @IsString()
  @IsNotEmpty()
  auth: string;
}

export class PushSubscriptionDto {
  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/dXa...' })
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @ApiProperty({ type: PushKeysDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}

export class SubscribeDto {
  @ApiProperty({ type: PushSubscriptionDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionDto)
  subscription: PushSubscriptionDto;

  @ApiProperty({ example: '69120ef5d617f361c1b666f7' })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;
}