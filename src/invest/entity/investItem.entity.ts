import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {InvestGroupEntity, InvestUnitEntity} from '@app/invest/entity';
import {EInvestItemType} from '@app/invest/invest.enum';
import {UserEntity} from '@app/user/entity';
import {DateTransformer} from '@common/db';

@Entity('invest_item')
@Index('IDX_USER', ['user_idx'])
@Index('IDX_ITEM_TYPE', ['item_type'])
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
  item_type: EInvestItemType;

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
    type: 'date',
    nullable: true,
    transformer: new DateTransformer('YYYY-MM-DD'),
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

  @ManyToMany(() => InvestGroupEntity, (data) => data.investItem)
  @JoinTable({
    name: 'invest_group_item',
    joinColumn: {name: 'item_idx', referencedColumnName: 'item_idx'},
    inverseJoinColumn: {name: 'group_idx', referencedColumnName: 'group_idx'},
  })
  investGroup: InvestGroupEntity[];

  @ManyToMany(() => InvestUnitEntity, (data) => data.investItem)
  @JoinTable({
    name: 'invest_unit_set',
    joinColumn: {name: 'item_idx', referencedColumnName: 'item_idx'},
    inverseJoinColumn: {name: 'unit_idx', referencedColumnName: 'unit_idx'},
  })
  investUnit: InvestUnitEntity[];
}
