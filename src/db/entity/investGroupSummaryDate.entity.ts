import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {InvestGroupEntity} from '@db/entity';
import {DateTransformer} from '@db/transformer';
import {EInvestSummaryDateType} from '@db/db.enum';

@Entity('invest_group_summary_date')
@Index('IDX_CREATED_AT', ['created_at'])
@Index('IDX_SUMMARY_TYPE', ['summary_date', 'group_idx', 'summary_type'])
@Index('IDX_GROUP', ['group_idx'])
export class InvestGroupSummaryDateEntity extends BaseEntity {
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
  group_idx: number;

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
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
    transformer: new DateTransformer(),
  })
  updated_at: string;

  /**
   * relations
   */
  @ManyToOne(() => InvestGroupEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'group_idx',
    referencedColumnName: 'group_idx',
    foreignKeyConstraintName: 'invest_group_summary_date_fk_1',
  })
  investGroup: InvestGroupEntity;
}
