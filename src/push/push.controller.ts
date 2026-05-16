import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PushService } from './push.service';
import { SubscribeDto } from './push.dto';

@ApiTags('Push Notifications')
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Register or refresh a Web Push subscription' })
  @ApiResponse({ status: 200, description: 'Subscription saved', schema: { example: { ok: true } } })
  async subscribe(
    @Body() dto: SubscribeDto,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.pushService.subscribe(dto, userAgent || '');
    return { ok: true };
  }
}