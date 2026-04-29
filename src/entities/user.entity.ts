import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Database entity representing a user in the TradeFlow system.
 * Users are primarily identified by their Stellar public key.
 */
@Entity('users')
export class User {
  /**
   * Internal unique identifier (UUID).
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The user's Stellar public key. Used for authentication and identifying on-chain activity.
   */
  @Column({ unique: true })
  publicKey: string;

  /**
   * Optional email address for notifications.
   */
  @Column({ nullable: true })
  email?: string;

  /**
   * Flag indicating if the user account is active.
   */
  @Column({ default: true })
  isActive: boolean;

  /**
   * Timestamp when the user record was created.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Timestamp when the user record was last updated.
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
