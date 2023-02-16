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

@Entity('invest_unit')
@Index('IDX_USER', ['user_idx'])
@Index('IDX_UNIT', ['unit'])
export class InvestUnitEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  unit_idx: number;

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
  unit: string;

  @Column({
    type: 'varchar',
    length: 5,
    nullable: false,
  })
  unit_type: string;

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
    foreignKeyConstraintName: 'invest_unit_fk_1',
  })
  user: UserEntity;
}
