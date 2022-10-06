import {Repository} from "typeorm";
import {UserEntity} from "../entities/user.entity";
import {ConflictException, Injectable, InternalServerErrorException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {CreateUserDto} from "../dto/CreateUser.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public async createUser(createUserDto: CreateUserDto): Promise<UserEntity>
  {
    const {username, password} = createUserDto;

    const passwordSalt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, passwordSalt);

    const user = this.create({username: username, password: hashedPassword});

    try {
      await this.save(user);
    } catch (err) {
      if (err.code == '23505') {
        throw new ConflictException('Existing username');
      } else {
        throw new InternalServerErrorException();
      }
    }

    return user;
  }
}