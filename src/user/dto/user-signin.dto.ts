import { IsEmail, IsNotEmpty, MinLength } from "class-validator"

export class UserSignInDto {
    @IsEmail()
    @IsNotEmpty({message: "Email is required"})
    email: string

    @IsNotEmpty({message: "Password is required"})
    @MinLength(6, {message: "Password must be of 6 character"})
    password: string
}