import {BaseEntity, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {InvestGroupEntity, InvestItemEntity} from '@db/entity';

@Entity('invest_group_item')
@Index('IDX_ITEM', ['item_idx'])
export class InvestGroupItemEntity extends BaseEntity {
  @PrimaryColumn({
    type: 'int',
    unsigned: true,
  })
  group_idx: number;

  @PrimaryColumn({
    type: 'int',
    unsigned: true,
  })
  item_idx: number;

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
    foreignKeyConstraintName: 'invest_group_item_fk_1',
  })
  investGroup: InvestGroupEntity;

  @ManyToOne(() => InvestItemEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'item_idx',
    referencedColumnName: 'item_idx',
    foreignKeyConstraintName: 'invest_group_item_fk_2',
  })
  investItem: InvestItemEntity;
}
