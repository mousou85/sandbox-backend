import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {DateTransformer} from '@db/transformer';
import {UserEntity} from '@db/entity';

@Entity('invest_group')
@Index('IDX_USER', ['user_idx'])
export class InvestGroupEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  group_idx: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  user_idx: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  group_name: string;

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
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_idx',
    referencedColumnName: 'user_idx',
    foreignKeyConstraintName: 'invest_group_fk_1',
  })
  user: UserEntity;
}
