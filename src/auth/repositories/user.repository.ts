import {Repository} from "typeorm";
import {UserEntity} from "../entities/user.entity";
import {ConflictException, Injectable, InternalServerErrorException} from "@nestjs/common";
import {UserCredentialDto} from "../dto/userCredentialDto";
import * as bcrypt from 'bcrypt';
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(@InjectRepository(UserEntity) repository: Repository<UserEntity>) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public async createUser(userCredentialDto: UserCredentialDto): Promise<UserEntity>
  {
    const {username, password} = userCredentialDto;

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