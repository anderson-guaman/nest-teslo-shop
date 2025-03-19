
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column('text',{
        unique: true,
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable:true
    })
    description: string;

    // no existen dos productos iguales slug:token , chip sustanctivos
    @Column('text',{
        unique:true
    })
    slug: string;

    @Column('int',{
        default:0
    })
    stock: number;

    @Column('text',{
        array:true
    })
    sizes: string[];

    @Column('text')
    gender: string;


    @Column('text',{
        array:true,
        default:[]
    })
    tags: string[]
    
    //images
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager:true} // eager siempre en la busqueda trae sus productos relacionados
    )
    images?: ProductImage[];

    //metodos o validaciones antes de insertar
    @BeforeInsert()
    checkSlugInsert(){
        if ( !this.slug ){
            this.slug = this.title
        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }
    //beforeUpdate
    @BeforeUpdate()
    checkSlugUpdate()
    {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }
}
