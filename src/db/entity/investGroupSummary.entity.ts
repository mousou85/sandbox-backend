import {
  BaseEntity,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import {DateHelper} from '@common/helper';
import {InvestGroupEntity} from '@db/entity';
import {DateTransformer} from '@db/transformer';

@Entity('invest_group_summary')
@Index('IDX_CREATED_AT', ['created_at'])
export class InvestGroupSummaryEntity extends BaseEntity {
  @PrimaryColumn({
    type: 'int',
    unsigned: true,
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
  @ManyToOne(() => InvestGroupEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'group_idx',
    referencedColumnName: 'group_idx',
    foreignKeyConstraintName: 'invest_group_summary_fk_1',
  })
  investGroup: InvestGroupEntity;
}
