import { DataSource, IsNull, MoreThan, Not, Or, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Accounts } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { VerificationsService } from 'src/verifications/verifications.service';
import * as bcrypt from 'bcryptjs';
import { LoginAccountDto } from './dto/login-account.dto';
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/roles/entities/role.entity';
import { differenceInSeconds } from 'date-fns';
import { Verifications } from 'src/verifications/entities/verification.entity';
import { FilesService } from 'src/files/files.service';
import { generateMessage } from 'src/common/messages/index.messages';
import { UpdateMyAccountDto } from './dto/update-my-account.dto';

@Injectable()
export class AccountsService {
  private saltOrRounds = 10;
  private TIME_VERIFY_SECOND: number;
  constructor(
    @InjectRepository(Accounts)
    @Inject(forwardRef(() => VerificationsService))
    private accountsRepository: Repository<Accounts>,
    @InjectRepository(Roles)
    private rolesRepositoty: Repository<Roles>,
    @InjectRepository(Verifications)
    private verifyRepositoty: Repository<Verifications>,
    private verifySevice: VerificationsService,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
  ) {
    this.TIME_VERIFY_SECOND = Number(process.env.TIME_VERIFY_SECOND);
  }

  async handleLoginAccount(loginAccountDto: LoginAccountDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await this.accountsRepository.findOne({
        relations: {
          roles: true,
        },
        where: [
          { email: loginAccountDto.emailAndPhone },
          { phone: loginAccountDto.emailAndPhone },
        ],
        select: [
          'password',
          'id',
          'ban',
          'fullname',
          'password',
          'gender',
          'phone',
          'birthday',
          'email',
          'avatar',
        ],
      });
      if (!result) {
        throw new Error();
      }
      if (result.ban) {
        throw new ForbiddenException({
          message: 'Tài khoản của bạn đã bị ban vĩnh viễn.',
        });
      }
      // console.log(result.ban);
      const isMatch = await bcrypt.compare(
        loginAccountDto.password,
        result.password,
      );
      if (!isMatch) {
        throw new Error();
      }
      const { AT, RT, expAt } = await this.authService.createATRFToken(
        result.id,
      );
      // await this.handleUpdateAccount(result.id, { refresh_token: RT });
      const resultUpdate = await queryRunner.manager.update(
        Accounts,
        { id: result.id },
        {
          refresh_token: RT,
        },
      );
      if (!resultUpdate.affected) {
        throw new Error();
      }
      await queryRunner.commitTransaction();
      const { roles, ...user } = result;
      const { fullname, gender, phone, birthday, email, avatar } = user;
      return {
        message: 'Đăng nhập tài khoản thành công!',
        AT,
        RT,
        expAt,
        role: roles,
        user: { fullname, gender, phone, birthday, email, avatar },
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException({
        message: 'Có lỗi xảy ra xin vui lòng thử lại sau.',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async handleRefreshToken(RT: string) {
    try {
      if (!RT) {
        throw new ForbiddenException();
      }
      const checkToken = await this.authService.handleVerifyToken(RT);
      if (!checkToken) {
        throw new ForbiddenException();
      }
      const refreshToken = await this.accountsRepository.findOne({
        where: { id: checkToken.id, refresh_token: RT, ban: false },
        select: ['id'],
      });
      if (!refreshToken) {
        throw new ForbiddenException();
      }
      const date = new Date();
      const exp = checkToken.exp - Math.floor(date.getTime() / 1000);
      const newToken = await this.authService.createATRFToken(
        checkToken.id,
        exp,
      );
      await this.handleUpdateAccount(checkToken.id, {
        refresh_token: newToken.RT,
      });
      return { exp, ...newToken };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async handleCreateVerify(createAccountDto: CreateAccountDto) {
    // Check email and phone
    await this.verifySevice.handleClearVerify();
    const isExits = await this.handleCheckFieldCreExists({
      email: createAccountDto.email,
      phone: createAccountDto.phone,
    });
    // console.log(isExits);
    if (isExits) {
      return isExits;
    }
    const checkVerify = await this.verifySevice.findOne({
      email: createAccountDto.email,
    });
    if (checkVerify) {
      return {
        errCode: 0,
        field: 'email',
        message: 'Email already exists',
      };
    }
    const resultCreVerify = await this.verifySevice.create({
      email: createAccountDto.email,
      code: Math.floor(100000 + Math.random() * 900000),
      data: {
        ...createAccountDto,
        password: await bcrypt.hash(
          createAccountDto.password,
          this.saltOrRounds,
        ),
      },
    });

    await this.verifySevice.handleSendEmail(
      resultCreVerify.email,
      resultCreVerify.code,
      createAccountDto.fullname,
    );

    return {
      id: resultCreVerify.id,
    };
  }

  async handleCreateAccount(
    data: CreateAccountDto,
    hash: boolean,
    id?: number,
  ) {
    const username = data.fullname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const usid = await this.handleRamdomUsid(
      username.replace(/\s/g, '-'),
      Number(id ? id : 1),
    );
    const isExits = await this.handleCheckFieldCreExists({
      email: data.email,
      phone: data.phone,
    });
    if (isExits) {
      return isExits;
    }
    const result = await this.accountsRepository.save({
      fullname: data.fullname,
      email: data.email,
      password: hash
        ? await bcrypt.hash(data.password, this.saltOrRounds)
        : data.password,
      birthday: data.birthday,
      gender: data.gender,
      phone: data.phone,
      usid: usid,
    });
    console.log(result);
    if (!result) {
      throw new Error();
    }
    return {
      message: 'Tạo tài khoản thành công!',
    };
  }

  async handleRamdomUsid(username: string, id: number) {
    const checkUsid = await this.accountsRepository.findOne({
      where: { usid: `@${username}` },
    });
    if (!checkUsid) {
      return `@${username}`;
    }
    const ramdom = async (name: string, value: number) => {
      const result = Math.floor(value + Math.random() * value * 10);
      const checkUsid = await this.accountsRepository.findOne({
        where: { usid: `@${name}-${result % 3}` },
      });
      if (checkUsid) {
        return false;
      } else {
        return `@${name}-${result}`;
      }
    };
    let result = await ramdom(username, id);
    while (!result) {
      id = id * 3;
      result = await ramdom(username, id);
    }
    return result;
  }

  async handleFindOne(data: { id: string; refresh_token?: string }) {
    return await this.accountsRepository.findOne({
      where: data,
      select: ['id', 'refresh_token'],
    });
  }

  async handleFindAll(id: any, rating: number) {
    return await this.accountsRepository.find({
      relations: { roles: true },
      where: [
        { id: Not(id), roles: { rating: Or(MoreThan(rating)) } },
        { id: Not(id), roles: IsNull() },
      ],
    });
  }

  async handleFindAndCountUsers() {
    return await this.accountsRepository.count({
      relations: { roles: true },
      where: { roles: IsNull() },
    });
  }

  async handleUpdateAccount(id: string, updateAccountDto: Partial<Accounts>) {
    const data = await this.accountsRepository.update(id, {
      refresh_token: updateAccountDto.refresh_token,
    });
    if (!data) {
      throw new Error();
    }
    return data;
  }

  async handleDelOneUser(id: string, ratingAccountReq: number) {
    await this.handleCheckRatingAccount(id, ratingAccountReq);
    const result = await this.accountsRepository.delete(id);
    if (!result) {
      throw new Error();
    }
    return result;
  }

  async handleCheckRatingAccount(id: any, ratingAccountReq: number) {
    const data = await this.accountsRepository.findOne({
      relations: { roles: true },
      where: { id: id },
      select: { roles: { rating: true }, id: true },
    });
    if (!data) {
      throw new Error();
    }
    const rating: number = data?.roles?.rating;
    if (rating && rating < ratingAccountReq) {
      throw new Error();
    }
    return true;
  }

  async handleGetInfoUser() {
    return await this.accountsRepository.findAndCount();
  }

  async handleGetRoleSet(rating: number) {
    return await this.rolesRepositoty.find({
      where: {
        rating: MoreThan(rating),
      },
    });
  }

  async handleBanAccount(id: any, action: boolean, ratingUser: number) {
    await this.handleCheckRatingAccount(id, ratingUser);
    return await this.accountsRepository.update(id, { ban: action });
  }

  async handleUpdateInfoUser(
    id: any,
    updateAccountDto: UpdateAccountDto,
    ratingAccountReq: number,
  ) {
    await this.handleCheckRatingAccount(id, ratingAccountReq);
    const isExits = await this.handleCheckFieldUpdateExists(id, {
      email: updateAccountDto.email ?? '',
      phone: updateAccountDto.phone ?? '',
    });
    if (isExits) {
      return isExits;
    }
    if (updateAccountDto.password) {
      updateAccountDto.password = await bcrypt.hash(
        updateAccountDto.password,
        this.saltOrRounds,
      );
    }
    await this.accountsRepository.update(id, updateAccountDto);
    return {
      message: 'Cập nhật tài khoản thành công!',
    };
  }

  async handleCheckFieldCreExists(field: {
    email: string;
    phone: string;
    usid?: string;
  }) {
    const emailIsExits = await this.accountsRepository.findOne({
      where: { email: field.email },
      select: ['email'],
    });
    const phoneIsExits = await this.accountsRepository.findOne({
      where: { phone: field.phone },
      select: ['phone'],
    });

    // console.log(emailIsExits, phoneIsExits);
    if (!emailIsExits && !phoneIsExits) {
      return;
    }
    if (emailIsExits && phoneIsExits) {
      return {
        field: {
          email: 'Email đã được sử dụng.',
          phone: 'Số điện thoại đã được sử dụng.',
        },
      };
    } else if (emailIsExits) {
      return {
        field: {
          email: 'Email đã được sử dụng.',
        },
      };
    } else if (phoneIsExits) {
      return {
        field: {
          phone: 'Số điện thoại đã được sử dụng.',
        },
      };
    }
  }

  async handleCheckFieldUpdateExists(
    id: string,
    field: { email: string; phone: string; usid?: string },
  ) {
    if (field.email && field.phone) {
      const emailIsExits = await this.accountsRepository.findOne({
        where: { id: Not(id), email: field.email },
        select: ['email'],
      });
      const phoneIsExits = await this.accountsRepository.findOne({
        where: { id: Not(id), phone: field.phone },
        select: ['phone'],
      });
      if (emailIsExits && phoneIsExits) {
        return {
          field: {
            email: 'Email đã được sử dụng.',
            phone: 'Số điện thoại đã được sử dụng.',
          },
        };
      } else if (emailIsExits) {
        return {
          field: {
            email: 'Email đã được sử dụng.',
          },
        };
      } else if (phoneIsExits) {
        return {
          field: {
            phone: 'Số điện thoại đã được sử dụng.',
          },
        };
      }
    } else if (field.email) {
      const emailIsExits = await this.accountsRepository.findOne({
        where: { id: Not(id), email: field.email },
        select: ['email'],
      });
      if (emailIsExits) {
        return {
          field: {
            email: 'Email đã được sử dụng.',
          },
        };
      }
    } else if (field.phone) {
      const phoneIsExits = await this.accountsRepository.findOneOrFail({
        where: { id: Not(id), phone: field.phone },
        select: ['phone'],
      });
      if (phoneIsExits) {
        return {
          field: {
            phone: 'Số điện thoại đã được sử dụng.',
          },
        };
      }
    } else if (field.usid) {
      const usidIsExits = await this.accountsRepository.findOneOrFail({
        where: { id: Not(id), usid: field.usid },
        select: ['usid'],
      });
      if (usidIsExits) {
        return {
          field: {
            usid: 'Số điện thoại đã được sử dụng.',
          },
        };
      }
    }
    return false;
  }

  async handleLogout(id: string) {
    const result = await this.accountsRepository.update(
      { id: id },
      { refresh_token: '' },
    );
    if (!result.affected) {
      throw new Error();
    }
    return {
      message: 'Đăng xuất tài khoản thành công!',
    };
  }

  async handleCreateVerifyForgetPass(data: { email: string; phone: string }) {
    await this.verifySevice.handleClearVerify();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const account = await this.accountsRepository.findOne({
        where: { email: data.email, phone: data.phone },
        select: ['id', 'fullname', 'ban'],
      });
      if (!account) {
        return {
          message: 'Email hoặc số điện thoại không chính xác!',
        };
      }
      if (account.ban) {
        return {
          message: 'Tài khoản đã bị khóa.',
        };
      }
      const isExits = await this.verifySevice.findOne({ email: data.email });
      if (isExits) {
        const curremtDate = new Date();
        const expVerify = differenceInSeconds(
          isExits.createdAt,
          curremtDate.setMinutes(
            curremtDate.getMinutes() - this.TIME_VERIFY_SECOND / 60,
          ),
        );
        return {
          message: 'Vui lòng thử lại sau 1h.',
          exp: expVerify,
        };
      }

      const resultCreVerify = await queryRunner.manager.save(Verifications, {
        email: data.email,
        forget_password: true,
        code: Math.floor(100000 + Math.random() * 900000),
      });
      await this.verifySevice.handleSendEmailForget(
        resultCreVerify.email,
        resultCreVerify.code,
      );
      await queryRunner.commitTransaction();
      return {
        token: resultCreVerify.id,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException({
        message: 'Có lỗi xảy ra xin vui lòng thử lại sau.',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async handleUpdateForgetPass(data: { id: string; password: string }) {
    const checkValid = await this.verifySevice.handleChangePassword(+data.id);
    if (!checkValid) {
      throw new Error();
    }
    const result = await this.accountsRepository.update(
      { email: checkValid },
      { password: await bcrypt.hash(data.password, this.saltOrRounds) },
    );
    if (!result) {
      throw new Error();
    }
    return {
      message: 'Đổi mật khẩu thành công!',
    };
  }

  async handleGetThisInfoUser(id: string) {
    return await this.accountsRepository.findOne({
      where: {
        id,
      },
      select: [
        'fullname',
        'avatar',
        'birthday',
        'gender',
        'email',
        'phone',
        'usid',
      ],
    });
  }

  async handleUpdateThisInfoUser(
    id: string,
    updateAccounDto: UpdateMyAccountDto,
    avatar?: Express.Multer.File,
  ) {
    try {
      const findAccountExist = await this.accountsRepository.findOne({
        where: {
          id,
        },
      });
      delete updateAccounDto.avatar;
      if (!findAccountExist) {
        throw new NotFoundException();
      }
      if (avatar) {
        const resultFile = await this.filesService.uploadFile(
          avatar,
          'avatars',
        );
        if (findAccountExist?.avatar) {
          await this.filesService.deleteFile(findAccountExist?.avatar);
        }
        updateAccounDto.avatar = resultFile.filePath;
      }
      const results = await this.accountsRepository.update(id, updateAccounDto);
      return generateMessage('accounts', 'updated', true);
    } catch (error) {
      throw error;
    }
  }

  async handleChangePass(data: {
    id: string;
    prevPass: string;
    newPass: string;
  }) {
    const account = await this.accountsRepository.findOne({
      where: { id: data.id },
      select: ['password'],
    });
    const isMatch = await bcrypt.compare(
      data.prevPass,
      account?.password ?? '',
    );
    if (isMatch) {
      const result = await this.accountsRepository.update(
        { id: data.id },
        {
          password: await bcrypt.hash(data.newPass, this.saltOrRounds),
          refresh_token: '',
        },
      );
      if (result.affected) {
        return {
          message: 'Đổi mật khẩu thành công vui lòng đăng nhập lại.',
        };
      }
    } else {
      throw new ConflictException({
        validators: {
          prevPassword: 'Mật khẩu không chính xác!',
        },
      });
    }
    // return await bcrypt.compare(data.prevPass, account.password);
    throw new Error();
  }

  async handleCountTotalAccounts() {
    return await this.accountsRepository.count({
      where: {
        roles: IsNull(),
      },
    });
  }
}
