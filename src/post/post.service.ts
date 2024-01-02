import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { DataSource, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async create(createPostDto: CreatePostDto, req: Request) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const post = this.postRepo.create(createPostDto);
      post.createdBy = await this.userService.currentUser(req);
      await queryRunner.manager.save(post);
      await queryRunner.commitTransaction();
      return { post };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error occured while creaing post');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const users = await this.postRepo.find({
      select: {
        id: true,
        title: true,
        description: true,
        rent: true,
        duration: true,
        createdBy: {
          name: true,
        },
      },
      relations: {
        createdBy: true,
      },
    });

    return { posts: users };
  }

  async findOne(id: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: {
        createdBy: true,
      },
    });
    if (!post) throw new BadRequestException('Post does not exist');
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const post = await this.postRepo.update(
        { id },
        {
          title: updatePostDto.title,
          description: updatePostDto.description,
          rent: updatePostDto.rent,
          updatedAt: new Date(),
        },
      );

      await queryRunner.manager.save(post);
      await queryRunner.commitTransaction();

      return { updated: post };
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
      const post = await this.findOne(id);
      await queryRunner.manager.delete(PostEntity, id);
      await queryRunner.commitTransaction();
      return { deleted: post };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error occured while deleting');
    } finally {
      await queryRunner.release();
    }
  }

  async filter(req: Request) {
    const builder = this.postRepo.createQueryBuilder('posts');
    if (req.query.search) {
      builder.where(
        'posts.title LIKE :query OR posts.description LIKE :query OR posts.location LIKE :query',
        { query: `%${req.query.search}%` },
      );
    }

    const sort: any = req.query.sort;

    if (sort) {
      builder.orderBy('posts.rent', sort.toUpperCase(), 'NULLS LAST');
    }

    const result =
      (await builder.getCount()) == 0
        ? `${req.query.search} Not Found`
        : await builder.getMany();
    return result;
  }
}
