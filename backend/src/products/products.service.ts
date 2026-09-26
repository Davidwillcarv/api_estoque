import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductsGateway } from './products.gateway';
import * as XLSX from 'xlsx';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productsGateway: ProductsGateway,
  ) {}

  private mapProductResponse(product: Product) {
    const priceNum = Number(product.price ?? 0);
    const qtyNum = Number(product.quantity ?? 0);

    return {
      ...product,
      price: priceNum,
      quantity: qtyNum,
      // Mapeamento em português para compatibilidade com a tabela e cards do front
      nome: product.name,
      categoria: product.category,
      preco: priceNum,
      estoque: qtyNum,
    };
  }

  async findAll() {
    const products = await this.productRepository.find({
      order: { createdAt: 'DESC' },
    });
    return products.map((p) => this.mapProductResponse(p));
  }

  async create(dto: any) {
    const skuGenerico = `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProduct = this.productRepository.create({
      sku: dto.sku || dto.SKU || skuGenerico,
      name: dto.name || dto.nome || 'Sem nome',
      category: dto.category || dto.categoria || 'Geral',
      price: Number(dto.price ?? dto.preco ?? 0),
      quantity: Number(dto.quantity ?? dto.estoque ?? 0),
    });

    await this.productRepository.save(newProduct);

    // Emite lista atualizada via WebSocket
    const allProducts = await this.findAll();
    this.productsGateway.notifyProductUpdate(allProducts);

    return this.mapProductResponse(newProduct);
  }

  async update(id: string, dto: any) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Produto não encontrado.`);
    }

    product.name = dto.name || dto.nome || product.name;
    product.sku = dto.sku || product.sku;
    product.category = dto.category || dto.categoria || product.category;
    product.price = dto.price !== undefined ? Number(dto.price) : product.price;
    product.quantity = dto.quantity !== undefined ? Number(dto.quantity) : product.quantity;

    const saved = await this.productRepository.save(product);

    const allProducts = await this.findAll();
    this.productsGateway.notifyProductUpdate(allProducts);

    return this.mapProductResponse(saved);
  }

  async remove(id: string) {
    await this.productRepository.delete(id);

    const allProducts = await this.findAll();
    this.productsGateway.notifyProductUpdate(allProducts);

    return { success: true };
  }

  async importExcel(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    const productsToCreate = rows.map((row) => {
      const preco = Number(row.Price || row.Preco || row.price || row.preco || 0);
      const estoque = Number(row.Quantity || row.Quantidade || row.quantity || row.quantidade || row.estoque || 0);
      const nome = row.Name || row.Nome || row.name || row.nome || 'Produto Sem Nome';
      const categoria = row.Category || row.Categoria || row.category || row.categoria || 'Geral';
      const sku = row.SKU || row.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

      return this.productRepository.create({
        sku,
        name: nome,
        category: categoria,
        price: preco,
        quantity: estoque,
      });
    });

    await this.productRepository.save(productsToCreate);

    const allProducts = await this.findAll();
    this.productsGateway.notifyProductUpdate(allProducts);

    return {
      message: `${productsToCreate.length} produtos importados com sucesso!`,
      importedCount: productsToCreate.length,
    };
  }
}