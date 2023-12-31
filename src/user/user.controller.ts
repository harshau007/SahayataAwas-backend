import { Controller, Get, Post, Body, Param, Delete, UseGuards, Res, Req, Patch } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignupDto } from './dto/user-signup.dto';
import { UserSignInDto } from './dto/user-signin.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/guards/authentication.gaurd';
import { Response } from 'express';
import { AuthorizationGuard } from 'src/auth/guards/authorization.guard';
import { Role } from 'decorator/role.decorator';
import { AuthRequest } from 'src/auth/types/authRequest.type';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService, private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: UserSignupDto) {
    return await this.usersService.signup(createUserDto);
  }

  @Post('signin')
  async signin(@Body() signinUserDto: UserSignInDto, @Res() response: Response) {
    const user = await this.usersService.signin(signinUserDto);
    const accessToken = await this.authService.accessToken(user.email, user.id, user.role );

    response.set('Authorization', 'Bearer ' + accessToken);
    response.cookie('Authorization', 'Bearer ' + accessToken, {httpOnly: true, secure: true});

    response.send({ user: user, accessToken: accessToken });
  }

  @Role(['student','admin'])
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
    return { "message": "User Updated" }
  }

  @Role(['admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('current')
  async getme(@Req() request: AuthRequest) {
    return this.usersService.currentUser(request);
  }
}