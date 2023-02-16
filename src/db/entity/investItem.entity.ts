import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {UserEntity} from '@db/entity';
import {EYNState} from '@db/db.enum';
import {DateTransformer} from '@db/transformer';

@Entity('invest_item')
@Index('IDX_USER', ['user_idx'])
@Index('IDX_ITEM_TYPE', ['item_type', 'is_close'])
@Index('IDX_SUMMARY_UNIT', ['summary_unit_idx'])
export class InvestItemEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  item_idx: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  user_idx: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  item_type: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  item_name: string;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
  })
  summary_unit_idx: number;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    transformer: new DateTransformer(),
  })
  created_at: string;

  @Column({
    type: 'enum',
    enum: EYNState,
    nullable: false,
    default: EYNState.n,
  })
  is_close: EYNState;

  @Column({
    type: 'timestamp',
    nullable: true,
    transformer: new DateTransformer(),
  })
  closed_at: string;

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
    foreignKeyConstraintName: 'invest_item_fk_1',
  })
  user: UserEntity;
}
