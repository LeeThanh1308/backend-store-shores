import { ConfigModule, ConfigService } from '@nestjs/config';

import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { BranchesModule } from './branches/branches.module';
import { CartsModule } from './carts/carts.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { DataSource } from 'typeorm';
import { FilesModule } from './files/files.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { IsUniqueConstraint } from './common/validators/unique.validator';
import { LikesModule } from './likes/likes.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductBrandsModule } from './product-brands/product-brands.module';
import { ProductColorsModule } from './product-colors/product-colors.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { ProductSizesModule } from './product-sizes/product-sizes.module';
import { ProductsModule } from './products/products.module';
import { RepliesModule } from './replies/replies.module';
import { RolesModule } from './roles/roles.module';
import { SlidersModule } from './sliders/sliders.module';
import { StoreItemsModule } from './store-items/store-items.module';
import { StoresModule } from './stores/stores.module';
import { TargetGroupsModule } from './target-groups/target-groups.module';
import { TempOrdersModule } from './temp-orders/temp-orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationsModule } from './verifications/verifications.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        database: configService.get('DB_NAME'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        entities: [join(__dirname, './**/*.entity{.ts,.js}')],
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options!).initialize();
        return dataSource;
      },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: `smtps://${configService.get('MAIL_USER')}:${configService.get('MAIL_PASS')}@${configService.get('MAIL_HOST')}`,
        defaults: {
          from: '"Stores shop" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    AuthModule,
    AccountsModule,
    VerificationsModule,
    RolesModule,
    ProductsModule,
    ProductImagesModule,
    ProductColorsModule,
    ProductSizesModule,
    ProductBrandsModule,
    CategoriesModule,
    BranchesModule,
    CommentsModule,
    LikesModule,
    StoresModule,
    TargetGroupsModule,
    FilesModule,
    StoreItemsModule,
    CartsModule,
    OrdersModule,
    SlidersModule,
    BlogsModule,
    RepliesModule,
    PaymentsModule,
    TempOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint],
})
export class AppModule {}
