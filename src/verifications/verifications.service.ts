import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Verifications } from './entities/verification.entity';
import {
  DataSource,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  Repository,
} from 'typeorm';
import * as CryptoJS from 'crypto-js';
import { AccountsService } from 'src/accounts/accounts.service';
import { MailerService } from '@nestjs-modules/mailer';
import { differenceInMinutes, differenceInSeconds } from 'date-fns';
import { UpdateAccountDto } from 'src/accounts/dto/update-account.dto';
import { DataVerify } from 'src/data_verify/entities/data_verify.entity';
import { CreateDataVerifyDto } from 'src/data_verify/dto/create-data_verify.dto';

@Injectable()
export class VerificationsService {
  private TIME_REFRESH_SECOND: number;
  private TIME_VERIFY_SECOND: number;
  constructor(
    @InjectRepository(Verifications)
    private verificationsRepository: Repository<Verifications>,
    @Inject(forwardRef(() => AccountsService))
    private readonly accountService: AccountsService,
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
  ) {
    this.TIME_REFRESH_SECOND = Number(process.env.TIME_REFRESH_SECOND);
    this.TIME_VERIFY_SECOND = Number(process.env.TIME_VERIFY_SECOND);
  }

  handleDecodeId(id: string): any {
    return new Promise(async (resolve) => {
      try {
        const decryptedData = await CryptoJS.AES.decrypt(
          CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(id)),
          process.env.CRY_KEY,
        ).toString(CryptoJS?.enc?.Utf8);
        if (decryptedData) {
          return resolve(+decryptedData);
        } else {
          return resolve(false);
        }
      } catch (e) {
        return resolve(false);
      }
    });
  }

  handleHiddenEmail(email: string) {
    const arr = email.split('@');
    const [a, b, ...args] = arr[0].split('');
    return a + b + args.join('').replace(/[a-zA-Z0-9]/g, '*') + '@' + arr[1];
  }

  async create(createVerificationDto: CreateVerificationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const results = await queryRunner.manager.create(Verifications, {
        email: createVerificationDto.email,
        code: createVerificationDto.code,
      });
      const { id, email, code } = await queryRunner.manager.save(
        Verifications,
        results,
      );
      await queryRunner.manager.save(DataVerify, {
        fullname: createVerificationDto?.data?.fullname,
        birthday: createVerificationDto?.data?.birthday,
        phone: createVerificationDto?.data?.phone,
        password: createVerificationDto?.data?.password,
        email: createVerificationDto?.data?.email,
        verification: {
          id,
          email,
          code,
        },
      });
      await queryRunner.commitTransaction();
      return { id, email, code };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new Error();
    } finally {
      await queryRunner.release();
    }
  }

  async handleClearVerify() {
    const timeExpVerify = new Date();
    timeExpVerify.setSeconds(
      timeExpVerify.getSeconds() - Number(process.env.TIME_VERIFY_SECOND),
    );
    await this.verificationsRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt <= :date', { date: timeExpVerify })
      .execute();
  }

  async handleVerifyEmail(id: any, verifyCode: number, password?: string) {
    await this.handleClearVerify();
    const handleCheckId = await this.verificationsRepository.findOne({
      where: { id: id },
      select: ['total_verify', 'forget_password'],
    });
    if (!handleCheckId) {
      throw new Error();
    }

    const dataVerify = await this.verificationsRepository.findOne({
      relations: {
        data: true,
      },
      where: { id: id, code: verifyCode, total_verify: MoreThan(0) },
    });
    if (!dataVerify) {
      if (handleCheckId.total_verify > 0) {
        await this.verificationsRepository.update(
          { id: id },
          { total_verify: --handleCheckId.total_verify, isSuccess: false },
        );
      }
      throw new Error();
    }
    if (dataVerify.data) {
      const resultCreAcc = await this.accountService.handleCreateAccount(
        dataVerify.data,
        false,
        Number(id),
      );
      if (!resultCreAcc) {
        throw new Error();
      }
      await this.verificationsRepository.delete({ id: id });
      return { message: 'Xác minh tài khoản thành công!' };
    }

    if (password && handleCheckId?.forget_password) {
      await this.verificationsRepository.update(
        { id: id },
        { isSuccess: true },
      );
      const result = await this.accountService.handleUpdateForgetPass({
        id: id,
        password,
      });
      if (!result) {
        throw new Error();
      }
      return {
        errCode: 1,
        message: 'Đổi mật khẩu thành công.!',
      };
    }
  }

  async handleRefreshCode(id: number) {
    try {
      await this.handleClearVerify();
      const curremtDate = new Date();
      curremtDate.setSeconds(
        curremtDate.getSeconds() - Number(process.env.TIME_REFRESH_SECOND),
      );
      const onFreshToken = await this.verificationsRepository.findOne({
        where: { id: +id, updatedAt: LessThanOrEqual(curremtDate) },
        relations: {
          data: true,
        },
      });

      if (!onFreshToken) {
        throw new Error();
      }
      const codeVerify = Math.floor(100000 + Math.random() * 900000);
      if (!onFreshToken?.forget_password) {
        const result = await this.handleSendEmail(
          onFreshToken?.email,
          codeVerify,
          onFreshToken?.data?.fullname,
        );
        if (!result) {
          throw new Error();
        }
      } else {
        const result = await this.handleSendEmailForget(
          onFreshToken?.email,
          codeVerify,
        );
        if (!result) {
          throw new Error();
        }
      }
      const dataVerify = await this.verificationsRepository.update(
        { id: id },
        {
          code: codeVerify,
          total_verify: 3,
        },
      );
      if (!dataVerify) {
        throw new Error();
      }
      return {
        message: 'Refresh code thành công!',
        data: await this.handleCheckRefreshCode(+id),
      };
    } catch (error) {
      console.log(error);
    }
  }

  async handleCheckRefreshCode(id: number) {
    await this.handleClearVerify();
    const curremtDate = new Date();
    const curremtVerify = new Date();
    const result = await this.verificationsRepository.findOne({
      where: { id: Number(id) },
      select: ['id', 'createdAt', 'updatedAt', 'email', 'total_verify'],
    });
    if (!result) {
      throw new Error();
    }
    const updatedAt = new Date(result.updatedAt);
    const createdAt = new Date(result.createdAt);
    const expRefreshToken = new Date(
      updatedAt.getTime() + this.TIME_REFRESH_SECOND * 1000,
    );
    const expVerify = new Date(
      createdAt.getTime() + this.TIME_VERIFY_SECOND * 1000,
    );
    return {
      email: this.handleHiddenEmail(result.email),
      expRefreshToken: expRefreshToken,
      expVerify: expVerify,
      total: result.total_verify,
    };
  }

  async handleSendEmail(emailTo: string, code: number, fullname: string) {
    const status = await this.mailerService.sendMail({
      to: emailTo,
      subject: 'Xác minh tài khoản',
      template: 'verifyCode/index',
      context: {
        code: code,
        fullname: fullname,
      },
    });
    if (!status) {
      Logger.error('Send email failed!');
      throw new Error('Send email failed');
    }
    Logger.log(`Send ${emailTo} successfully.`);
    return true;
  }

  async handleSendEmailForget(emailTo: string, code: number) {
    const status = await this.mailerService.sendMail({
      to: emailTo,
      subject: 'Lấy lại mật khẩu',
      template: 'forgetPass/index',
      context: {
        code: code,
      },
    });
    if (!status) {
      Logger.error('Send email failed!');
      throw new Error('Send email failed');
    }
    Logger.log(`Send ${emailTo} successfully.`);
    return true;
  }

  async findOne(filed: Partial<Verifications>) {
    return await this.verificationsRepository.findOneBy(filed);
  }

  async handleChangePassword(id: number) {
    await this.handleClearVerify();
    const result = await this.verificationsRepository.findOne({
      where: { id: id, isSuccess: true, total_verify: MoreThan(0) },
      select: ['email'],
    });
    if (!result) {
      return false;
    }
    await this.verificationsRepository.delete({ id: id });
    return result.email;
  }

  remove(id: number) {
    return this.verificationsRepository.delete(id);
  }
}
