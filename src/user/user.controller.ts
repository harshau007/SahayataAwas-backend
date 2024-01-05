import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  Patch,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserSignInDto } from './dto/user-signin.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/guards/authentication.gaurd';
import { Request, Response } from 'express';
import { AuthorizationGuard } from 'src/auth/guards/authorization.guard';
import { Role } from 'decorator/role.decorator';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() createUserDto: UserSignupDto) {
    return await this.usersService.signup(createUserDto);
  }

  @Post('signin')
  async signin(
    @Body() signinUserDto: UserSignInDto,
    @Res() response: Response,
  ) {
    const user = await this.usersService.signin(signinUserDto);
    const accessToken = await this.authService.accessToken(
      user.email,
      user.id,
      user.role,
    );

    response.setHeader('Authorization',accessToken).cookie('Authorization', accessToken).send({ user: user, accessToken: accessToken });
  }

  @Role(['student', 'admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Post('/signout')
  async signout(@Res() response: Response) {
    response
      .clearCookie('Authorization', {
        httpOnly: true,
        sameSite: 'lax',
      })
      .send({ message: 'Signed Out' });
  }

  @Role(['student', 'admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Role(['admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(+id);
  }

  @Role(['admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(+id, updateUserDto);
    return { message: 'User Updated', user };
  }

  @Role(['admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('current')
  async getme(@Req() request: Request) {
    return this.usersService.currentUser(request);
  }

  @Role(['student', 'admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Post('verify/token')
  async verify(@Req() request: Request) {
    return this.usersService.verifyToken(request);
  }
}
