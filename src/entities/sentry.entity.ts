import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * Database entity for Sentry-related invoice data.
 * Used for monitoring and tracking specific high-priority or automated invoice flows.
 */
@Entity('Sentry')
export class Sentry {
  /**
   * Internal auto-incrementing identifier.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The total monetary amount associated with this record.
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  /**
   * The date associated with this entry.
   */
  @Column({ type: 'timestamp' })
  date: Date;

  /**
   * Name of the customer or source entity.
   */
  @Column()
  customer: string;

  /**
   * Optional description or metadata notes.
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Risk assessment score (0-100).
   */
  @Column({ type: 'int', default: 0 })
  riskScore: number;

  /**
   * Current processing status.
   */
  @Column({ 
    type: 'varchar', 
    default: 'Pending',
    enum: ['Pending', 'Approved', 'High Risk', 'Rejected']
  })
  status: string;

  /**
   * Timestamp of when this entry was processed.
   */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  processedAt: Date;

  /**
   * The user associated with this entry.
   */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  /**
   * Foreign key reference to the user.
   */
  @Column({ nullable: true })
  userId?: string;

  /**
   * Record creation timestamp.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Record update timestamp.
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
