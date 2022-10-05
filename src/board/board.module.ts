import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {BoardEntity} from "./board.entity";
import {BoardRepository} from "./board.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardEntity])
  ],
  controllers: [BoardController],
  providers: [
    BoardService,
    BoardRepository,
  ]
})
export class BoardModule {}
