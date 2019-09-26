import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.interface';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

@Controller('users')
export class UsersController {
  constructor(public readonly userService: UserService) {}

  // TODO ADD getOne

  @Get()
  async getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post()
  async create(@Body() user: CreateUserDto): Promise<User> {
    return await this.userService.create(user);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id, @Body() user: UpdateUserDto): Promise<User> {
    return await this.userService.update(id, user);
  }

  @Delete(':id')
  async delete(@Param('id') id): Promise<User> {
    return await this.userService.delete(id);
  }

  @Put('/UpdateOrCreate/:id')
  async updateOrCreate(@Param('id') id, @Body() user: UpdateUserDto): Promise<User> {
    return await this.userService.updateOrCreate(id, user);
  }
}
