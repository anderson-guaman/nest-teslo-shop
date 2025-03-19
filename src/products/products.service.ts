
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductImage } from './entities';



@Injectable()
export class ProductsService {

   // pinta un error en consola de forma bonita 
   private readonly logger = new Logger('ProductsService');

   constructor(
      // Inyectamos un repositorio, se trabaja con el patron repositorio 
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
      @InjectRepository(ProductImage)
      private readonly productImageRepository: Repository<ProductImage>,
      private readonly dataSource:DataSource,

   ) { }


   async create(createProductDto: CreateProductDto) {
      try {

         const { images = [], ...productDetails } = createProductDto
         // crea y almacecena el producto mientras no se de save no se guarda en la base 
         const product = this.productRepository.create({
            ...productDetails,
            images: images.map(image => this.productImageRepository.create({ url: image })) // la imagen es url y el producto o id del producto pero al crear dentro de crear un producto typeorm lo asume por mi 
         });
         await this.productRepository.save(product)
         return { ...product, images }; // retorna el producto creado todo los campos de la tabla como el id y demas 
      } catch (error) {
         this.handleExeptions(error)
      }
   }


   async findAll(paginationDto: PaginationDto) {
      //offset: salta n registros y trae los proximos limit registros
      // en este caso lo vamos a usar como offset:page
      const { limit = 10, offset = 1 } = paginationDto;
      const product = this.productRepository.find({
         take: limit,
         skip: (offset * limit) - limit,
         //TODO: relaciones
         // trae el product como sus respectivas imagenes de acuerdo a su relacion en base de datos 
         relations: {
            images: true
         }
      });
      return (await product).map(product => ({
         ...product,
         images: product.images?.map(img => img.url),
      }));
   }

   async findOne(filtro: string) {
      let product: Product | null = null;

      //find with id
      if (!isNaN(+filtro)) {
         product = await this.productRepository.findOne({
            where: { id: +filtro }
         });
      } else { // find wit sql query
         // 'prod' alias a la tabala de productos
         const queryBuilder = this.productRepository.createQueryBuilder('prod'); // proteccion contra query inyeccion
         product = await queryBuilder
            .where('UPPER(title) =:title or slug =:slug', {
               title: filtro.toUpperCase(),
               slug: filtro.toLowerCase(),
            })
            // prod.imgaes leftjoin en el select del query para buscar un producto 
            .leftJoinAndSelect('prod.images', 'prodImages') // prodImages alias a la tabla de imganes 
            .getOne();
      }

      // // find with slug
      // if( product === null ){
      //   product = await this.productRepository.findOne({
      //     where: { slug: filtro}
      //   });
      // }
      if (!product)
         throw new NotFoundException('Product with id not found')
      return product;
   }

   async findOnePlain(filtro: string) {
      const { images = [], ...product } = await this.findOne(filtro);
      return {
         ...product,
         images: images.map(img => img.url)
      }
   }

   async update(id: number, updateProductDto: UpdateProductDto) {
      const { images, ...rest } = updateProductDto;
      // primero busca un product por el id y prepara el producto para actualizarce
      const product = await this.productRepository.preload({ id, ...rest });
      // create query runner
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {

         if( images ){
            await queryRunner.manager.delete( ProductImage, { product:{ id }} )
            product!.images = images.map( image => this.productImageRepository.create({ url: image }));
         }else{
            // ??
         }

         await queryRunner.manager.save( product );

         // if (product) {
         //    await this.productRepository.save(product);
         // }

         await queryRunner.commitTransaction();
         return this.findOnePlain(id.toString());

      } catch (error) {
         await queryRunner.rollbackTransaction();
         await queryRunner.release();
         this.handleExeptions(error)
      }
   }

   async remove(id: number) {
      const product = await this.productRepository.findOne({ where: { id: +id } })
      if (product)
         await this.productRepository.remove(product);
      return product;
   }

   private handleExeptions(error: any) {
      if (error.code === '23505')
         throw new BadRequestException(error.detail);

      this.logger.error(error); // solo muestra el error en consolosa de manera estilisada
      throw new InternalServerErrorException('Unexpected error, check server logs');
   }

   async deleteAllProducts(){
      const query = this.productRepository.createQueryBuilder('product');
      try {
         return await query
            .delete()
            .where({})
            .execute();
      } catch (error) {
         this.handleExeptions(error)
      }
   }
}
