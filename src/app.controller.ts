import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { AppService } from './app.service';
import ITradeBody from './interfaces/ITradeBody';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  home() {
    return 'HELLO !';
  }

  @Post('buy')
  buy(@Body() body: ITradeBody) {
    try {
      return this.appService.buy(body);
    } catch (e) {
      return new HttpException(e.message, 500);
    }
  }

  @Post('sell')
  sell(@Body() body: ITradeBody) {
    try {
      return this.appService.sell(body);
    } catch (e) {
      return new HttpException(e.message, 500);
    }
  }
}
