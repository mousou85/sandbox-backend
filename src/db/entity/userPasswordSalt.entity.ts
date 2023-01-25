import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from 'typeorm';
import {UserEntity} from '@db/entity/user.entity';

@Entity('users_password_salt')
export class UserPasswordSaltEntity extends BaseEntity {
  @PrimaryColumn({
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  user_idx: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  salt: string;

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
    foreignKeyConstraintName: 'users_password_salt_fk_1',
  })
  user: UserEntity;
}
