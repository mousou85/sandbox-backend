import {
  BaseEntity,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {DateHelper} from '@common/helper';
import {EInvestSummaryDateType} from '@db/db.enum';
import {InvestItemEntity, InvestUnitEntity} from '@db/entity';
import {DateTransformer} from '@db/transformer';

@Entity('invest_summary_date')
@Index('IDX_CREATED_AT', ['created_at'])
@Index('IDX_ITEM', ['item_idx'])
@Index('IDX_UNIT', ['unit_idx'])
@Index('IDX_SUMMARY_TYPE', ['summary_date', 'item_idx', 'summary_type'])
export class InvestSummaryDateEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  summary_idx: number;

  @Column({
    type: 'enum',
    enum: EInvestSummaryDateType,
    nullable: false,
  })
  summary_type: EInvestSummaryDateType;

  @Column({
    type: 'date',
    nullable: false,
    transformer: new DateTransformer('YYYY-MM-DD'),
  })
  summary_date: string;

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
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  inout_total: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  inout_principal_prev: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  inout_principal_current: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  inout_principal_total: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  inout_proceeds_prev: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  inout_proceeds_current: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  inout_proceeds_total: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  revenue_total: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  revenue_interest_prev: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  revenue_interest_current: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  revenue_interest_total: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  revenue_eval: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  revenue_eval_prev: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  earn: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  earn_prev_diff: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  earn_rate: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  earn_rate_prev_diff: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  earn_inc_proceeds: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  earn_inc_proceeds_prev_diff: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  earn_rate_inc_proceeds: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  earn_rate_inc_proceeds_prev_diff: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    transformer: new DateTransformer(),
  })
  created_at: string;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
    transformer: new DateTransformer(),
  })
  updated_at: string;

  /**
   * hooks
   */
  @BeforeUpdate()
  private setUpdatedAt() {
    this.updated_at = DateHelper.format();
  }

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
    foreignKeyConstraintName: 'invest_summary_date_fk_1',
  })
  investItem: InvestItemEntity;

  @ManyToOne(() => InvestUnitEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'unit_idx',
    referencedColumnName: 'unit_idx',
    foreignKeyConstraintName: 'invest_summary_date_fk_2',
  })
  investUnit: InvestUnitEntity;
}
