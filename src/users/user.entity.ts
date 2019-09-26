import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({default: null})
  firstName: string;

  @Column({default: null})
  lastName: string;

  @Column({default: null})
  phone: string;

  @Column({default: null})
  email: string;
}
