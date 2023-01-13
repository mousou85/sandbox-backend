import {BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';
import {EYNState} from '@db/db.enum';
import {DateTransformer} from '@db/transformer';

@Entity('users')
@Index('IDX_USER_ID', ['id'])
@Index('IDX_CREATED_AT', ['created_at'])
@Index('IDX_LAST_LOGIN_AT', ['last_login_at'])
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: 'user IDX',
  })
  user_idx: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'user id',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'user password',
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: 'user name',
  })
  name: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    transformer: new DateTransformer(),
  })
  created_at: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    transformer: new DateTransformer(),
  })
  last_login_at: string;

  @Column({
    type: 'tinyint',
    unsigned: true,
    nullable: false,
    default: 0,
  })
  login_fail_count: number;

  @Column({
    type: 'enum',
    enum: EYNState,
    nullable: false,
    default: EYNState.n,
  })
  use_otp: EYNState;
}
