import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

export enum UserRole {
  OWNER = 'owner', 
  HOST = 'host',   
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.HOST })
  role: UserRole;

  @Column()
  name: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.staff, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  restaurant: Restaurant;

  @CreateDateColumn()
  createdAt: Date;
}