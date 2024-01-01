import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  rent: number;

  @Column('simple-array')
  images: string[];

  @Column({ default: 7 })
  duration: number;

  @Column()
  location: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Timestamp;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Timestamp;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  createdBy: UserEntity;
}
