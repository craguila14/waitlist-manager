import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

export enum WaitlistEntryStatus {
  WAITING = 'waiting',     
  CALLED = 'called',       
  SEATED = 'seated',       
  CANCELLED = 'cancelled',
  FINISHED   = 'finished' 
}

@Entity('waitlist_entries')
export class WaitlistEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  guestName: string;

  @Column()
  partySize: number;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: WaitlistEntryStatus,
    default: WaitlistEntryStatus.WAITING,
  })
  status: WaitlistEntryStatus;

  @Column({ default: 0 })
  position: number;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  calledAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  seatedAt: Date | null;

  @Column({ type: "varchar", nullable: true })
  notes: string | null;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.waitlistEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  restaurant: Restaurant;
}