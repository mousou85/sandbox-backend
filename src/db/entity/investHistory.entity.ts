import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {InvestItemEntity, InvestUnitEntity} from '@db/entity';
import {EInvestHistoryInOutType, EInvestHistoryRevenueType, EInvestHistoryType} from '@db/db.enum';
import {DateTransformer} from '@db/transformer';

@Entity('invest_history')
@Index('IDX_ITEM', ['item_idx'])
@Index('IDX_UNIT', ['unit_idx'])
@Index('IDX_HISTORY_DATE', ['history_date'])
@Index('IDX_CREATED_AT', ['created_at'])
@Index('IDX_INOUT', ['inout_type', 'history_type'])
@Index('IDX_REVENUE', ['revenue_type', 'history_type'])
export class InvestHistoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  history_idx: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  item_idx: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: false,
  })
  unit_idx: number;

  @Column({
    type: 'date',
    nullable: true,
    transformer: new DateTransformer('YYYY-MM-DD'),
  })
  history_date: string;

  @Column({
    type: 'enum',
    enum: EInvestHistoryType,
    nullable: false,
  })
  history_type: EInvestHistoryType;

  @Column({
    type: 'enum',
    enum: EInvestHistoryInOutType,
    nullable: true,
  })
  inout_type: EInvestHistoryInOutType;

  @Column({
    type: 'enum',
    enum: EInvestHistoryRevenueType,
    nullable: true,
  })
  revenue_type: EInvestHistoryRevenueType;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  val: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  memo: string;

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
  @ManyToOne(() => InvestItemEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'item_idx',
    referencedColumnName: 'item_idx',
    foreignKeyConstraintName: 'invest_history_fk_1',
  })
  investItem: InvestItemEntity;

  @ManyToOne(() => InvestUnitEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'unit_idx',
    referencedColumnName: 'unit_idx',
    foreignKeyConstraintName: 'invest_history_fk_2',
  })
  investUnit: InvestUnitEntity;
}
