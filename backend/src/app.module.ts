import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { Product } from './products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1', // <--- Alterado de 'localhost' para '127.0.0.1'
      port: 5432,
      username: 'postgres',
      password: '123',      // Confirme se é a mesma senha definida na instalação
      database: 'stockmanager',
      entities: [Product],
      synchronize: true,    // Cria e atualiza a tabela 'products' automaticamente
    }),
    ProductsModule,
    AuthModule,
  ],
})
export class AppModule {}