import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { User } from './user.interface';


@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user)
  }

  async update(id: any, user: User): Promise<User> {
    // trying to update a user with an invalid id ?
    if (await this.findById(id) == null) {
      throw new HttpException(
        `invalid id: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.userRepository.update(id, user);
    return await this.findById(id);
  }

  async updateOrCreate(id: any, user: User): Promise<User> {
    await this.userRepository.update(id, user);
    return await this.findById(id);
  }

  async delete(id: any): Promise<User> {
    let user = await this.findById(id)

    if (user == null) {
      throw new HttpException(
        `invalid id: ${id}`,
        HttpStatus.NOT_FOUND
      );
    }

    await this.userRepository.delete(user);
    return user;
  }

  private async findById(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: [{ id: id }],
    });
  }
}
