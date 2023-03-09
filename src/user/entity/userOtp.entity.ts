import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from 'typeorm';

import {UserEntity} from '@app/user/entity';

@Entity('users_otp')
export class UserOtpEntity extends BaseEntity {
  @PrimaryColumn({
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  user_idx: number;

  @Column({
    type: 'varchar',
    length: 52,
    nullable: false,
  })
  secret: string;

  /**
   * relations
   */
  @OneToOne(() => UserEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_idx',
    referencedColumnName: 'user_idx',
    foreignKeyConstraintName: 'users_otp_fk_1',
  })
  user: UserEntity;
}
