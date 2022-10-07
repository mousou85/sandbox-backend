import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {BoardEntity} from "./board.entity";
import {BoardRepository} from "./board.repository";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardEntity]),
    AuthModule,
  ],
  controllers: [BoardController],
  providers: [
    BoardService,
    BoardRepository,
  ]
})
export class BoardModule {}
