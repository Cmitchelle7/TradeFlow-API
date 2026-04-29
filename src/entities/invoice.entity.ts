import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * Database entity representing a financial invoice.
 * Tracks amount, customer details, risk assessment, and processing status.
 */
@Entity('invoices')
export class Invoice {
  /**
   * Internal auto-incrementing identifier.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The total monetary amount of the invoice.
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  /**
   * The date the invoice was issued.
   */
  @Column({ type: 'timestamp' })
  date: Date;

  /**
   * Name of the customer or counterparty.
   */
  @Column()
  customer: string;

  /**
   * Optional description or notes regarding the invoice.
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Risk score calculated by the RiskService (0-100).
   */
  @Column({ type: 'int', default: 0 })
  riskScore: number;

  /**
   * Current status of the invoice in the workflow.
   */
  @Column({ 
    type: 'varchar', 
    default: 'Pending',
    enum: ['Pending', 'Approved', 'High Risk', 'Rejected']
  })
  status: string;

  /**
   * Timestamp indicating when the invoice was processed by the system.
   */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  processedAt: Date;

  /**
   * The user who uploaded or owns this invoice.
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
