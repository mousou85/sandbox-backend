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
import {DateTransformer} from '@db/transformer';

@Entity('invest_summary')
@Index('IDX_CREATED_AT', ['created_at'])
@Index('IDX_ITEM', ['item_idx'])
@Index('IDX_UNIT', ['unit_idx'])
export class InvestSummaryEntity extends BaseEntity {
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
  unit_idx: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  item_type: string;

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
  inout_principal: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  inout_proceeds: number;

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
  revenue_interest: number;

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
  earn: number;

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
  earn_inc_proceeds: number;

  @Column({
    type: 'double',
    unsigned: false,
    nullable: false,
    default: 0,
  })
  earn_rate_inc_proceeds: number;

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
  @ManyToOne(() => InvestItemEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'item_idx',
    referencedColumnName: 'item_idx',
    foreignKeyConstraintName: 'invest_summary_fk_1',
  })
  investItem: InvestItemEntity;

  @ManyToOne(() => InvestUnitEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'unit_idx',
    referencedColumnName: 'unit_idx',
    foreignKeyConstraintName: 'invest_summary_fk_2',
  })
  investUnit: InvestUnitEntity;
}
