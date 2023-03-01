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

@Entity('invest_unit_set')
@Index('IDX_ITEM', ['item_idx'])
@Index('IDX_UNIT', ['unit_idx'])
export class InvestUnitSetEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  unit_set_idx: number;

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
    foreignKeyConstraintName: 'invest_unit_set_fk_1',
  })
  investItem: InvestItemEntity;

  @ManyToOne(() => InvestUnitEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'unit_idx',
    referencedColumnName: 'unit_idx',
    foreignKeyConstraintName: 'invest_unit_set_fk_2',
  })
  investUnit: InvestUnitEntity;
}
