import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title:string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?:number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?:number;

    @IsString({each:true})// each:true : cada uno de los elementos del arreglo deben ser cumplir lo mismo isstring
    @IsArray()
    sizes: string[];

    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @IsArray()
    @IsString({ each:true })
    @IsOptional()
    tags?:string[]

    @IsArray()
    @IsString({ each:true })
    @IsOptional()
    images?:string[]

}
