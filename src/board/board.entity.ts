import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "../auth/entities/user.entity";

export enum BoardStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

@Entity('board')
export class BoardEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  desc: string;
  @Column()
  status: BoardStatus;

  @ManyToOne((type) => UserEntity, (user) => user.boards, {
    eager: false
  })
  user: UserEntity;
}