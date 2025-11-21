import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { RestaurantsModule } from './restaurants/restaurant.module';
import { AddressModule } from './address/address.module';
import { NotificationModule } from './notifications/notification.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './orders/order.module';

@Module({
  imports: [
   // ✅ Load .env file automatically
    ConfigModule.forRoot({
      isGlobal: true, // makes it available everywhere
    }),

    // ✅ Use your environment variable here
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/', {
      dbName: process.env.DB_NAME || 'fooddelivery',
    }),
    UsersModule,
    RestaurantsModule,
    AddressModule,
    NotificationModule,
    MenuModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    const dbName = this.connection?.db?.databaseName || '(unknown)'
    console.log('✅ Connected to MongoDB database:', dbName);
  }
}
