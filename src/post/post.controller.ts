import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Role } from 'decorator/role.decorator';
import { AuthGuard } from 'src/auth/guards/authentication.gaurd';
import { AuthorizationGuard } from 'src/auth/guards/authorization.guard';
import { Request } from 'express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Role(['student', 'admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    return this.postService.create(createPostDto, req);
  }

  @Role(['student', 'admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Role(['student', 'admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Role(['student', 'admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Role(['student', 'admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }

  @Role(['student', 'admin'])
  @UseGuards(AuthGuard, AuthorizationGuard)
  @Get('search/query')
  search(@Req() req: Request) {
    return this.postService.filter(req);
  }
}
