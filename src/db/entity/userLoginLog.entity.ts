import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {DateTransformer, Ip2LongTransformer} from '@db/transformer';
import {UserEntity} from '@db/entity/user.entity';

/**
 * user login log types
 */
export const EUserLoginLogType = {
  BAD_REQUEST: 'badRequest',
  LOGIN: 'login',
  ATTEMPT: 'attempt',
  PASSWORD_MISMATCH: 'passwordMismatch',
  LOGIN_FAIL_EXCEED: 'loginFailExceed',
} as const;
export type EUserLoginLogType = (typeof EUserLoginLogType)[keyof typeof EUserLoginLogType];

@Entity('users_login_log')
@Index('IDX_USER', ['user_idx', 'log_type'])
@Index('IDX_CREATED_AT', ['created_at'])
export class UserLoginLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: 'log IDX',
  })
  log_idx: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  user_idx: number;

  @Column({
    type: 'enum',
    enum: EUserLoginLogType,
    nullable: false,
    default: EUserLoginLogType.BAD_REQUEST,
  })
  log_type: EUserLoginLogType;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
    transformer: new Ip2LongTransformer(),
  })
  ip: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  user_agent: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    transformer: new DateTransformer(),
  })
  created_at: string;

  /**
   * relations
   */
  @ManyToOne(() => UserEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'user_idx',
    referencedColumnName: 'user_idx',
    foreignKeyConstraintName: 'users_login_log_fk_1',
  })
  user: UserEntity;
}
