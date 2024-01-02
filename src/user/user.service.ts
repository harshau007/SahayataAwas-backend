import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UserSignupDto } from './dto/user-signup.dto';
import { hash, compare } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: UserSignupDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    createUserDto.password = await hash(createUserDto.password, 10);

    if (await this.UserExist(createUserDto.email))
      throw new BadRequestException('Email Already Exists');

    try {
      const user = this.userRepo.create(createUserDto);
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      delete user.password;
      return { user: user };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error occured while registering');
    } finally {
      await queryRunner.release();
    }
  }

  async signin(signinUser: UserSignInDto) {
    if (!(await this.UserExist(signinUser.email)))
      throw new BadRequestException('Email does not exists');

    const user = await this.userRepo
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email=:email', { email: signinUser.email })
      .getOne();

    const matchedPass = await compare(signinUser.password, user.password);

    if (!matchedPass) throw new BadRequestException('Password is incorrect');

    delete user.password;

    return user;
  }

  async findAll() {
    const users = await this.userRepo.find({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return { users: users };
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (!user) throw new BadRequestException('User does not exist');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepo.update(
        { id },
        {
          name: updateUserDto.name,
          email: updateUserDto.email,
          password: updateUserDto.password,
          updatedAt: new Date(),
        },
      );

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return { updated: user };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error occured while updating');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findOne(id);
      await queryRunner.manager.delete(UserEntity, id);
      await queryRunner.commitTransaction();
      return { deleted: user };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error occured while deleting');
    } finally {
      await queryRunner.release();
    }
  }

  async UserExist(email: string) {
    return await this.userRepo.findOneBy({ email });
  }

  async currentUser(request: Request) {
    const token = request.cookies.Authorization;
    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.SECRET,
    });
    const { email } = payload;
    return await this.UserExist(email);
  }
}
