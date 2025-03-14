import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto{
    @IsOptional()
    @IsPositive()
    //transforma la data en un number de nodejs
    @Type( () => Number ) // enableImplicitConversions : true
    limit?: number;

    @IsOptional()
    @IsPositive()
    @Min(0)
    //transforma la data en un number de nodejs
    @Type( () => Number ) // enableImplicitConversions : true
    offset?: number;
}