import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreatePostDto {
    @IsString()
    title: string 

    @IsString()
    description: string

    @IsNotEmpty()
    @IsNumber()
    rent: number

    @IsNotEmpty()
    images: string[]

    @IsNumber()
    duration: number

    @IsString()
    @IsNotEmpty()
    location: string
}
