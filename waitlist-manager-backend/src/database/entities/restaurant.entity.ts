import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Table } from './table.entity';
import { WaitlistEntry } from './waitlist-entry.entity';
import { User } from './user.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ default: 0 })
  estimatedWaitMinutes: number;

  @OneToMany(() => User, (user) => user.restaurant)
  staff: User[];

  @OneToMany(() => Table, (table) => table.restaurant)
  tables: Table[];

  @OneToMany(() => WaitlistEntry, (entry) => entry.restaurant)
  waitlistEntries: WaitlistEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = this.name
        .toLowerCase()
        .normalize('NFD')                    
        .replace(/[\u0300-\u036f]/g, '')     
        .replace(/[^a-z0-9\s-]/g, '')        
        .trim()
        .replace(/\s+/g, '-');               
    }
  }
}