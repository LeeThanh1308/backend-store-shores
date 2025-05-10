import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Res,
  NotFoundException,
  Req,
  HttpCode,
  UseGuards,
  ForbiddenException,
  Ip,
  Logger,
  Delete,
  Patch,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { LoginAccountDto } from './dto/login-account.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response, response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserRoles } from 'src/guards/roles.decorator';
import { EnumRoles } from 'src/guards/user-role.enum';
import { unlink } from 'fs';
import { ForgetAccountDto } from './dto/forget-account.dto';
import { UploadImageValidationPipe } from 'src/common/validators/upload-image.validator';
import { UpdateMyAccountDto } from './dto/update-my-account.dto';

@Controller('accounts')
export class AccountsController {
  private readonly JWT_RT_EXP_SECOND: number;
  constructor(private readonly accountsService: AccountsService) {
    this.JWT_RT_EXP_SECOND = Number(process.env.JWT_RT_EXP_SECOND);
  }

  @Post('login')
  @HttpCode(200)
  async onLoginAccount(
    @Res() res: Response,
    @Body() loginAccountDto: LoginAccountDto,
  ) {
    try {
      const data =
        await this.accountsService.handleLoginAccount(loginAccountDto);
      const { RT, user, role, ...args } = data;
      res.cookie('RT', RT, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: this.JWT_RT_EXP_SECOND * 1000,
      });
      return res.json({
        token: {
          exp: args.expAt,
          token: args.AT,
        },
        role: role?.description,
        user,
        // exp: this.JWT_RT_EXP_SECOND,
      });
    } catch (e) {
      throw new NotFoundException({
        message:
          e.status === 403
            ? e.errMgs
            : 'Thông tin tài khoản mật khẩu không chính xác.',
      });
    }
  }

  @Post('refresh')
  async onRefreshToken(@Req() request: Request, @Res() res: Response) {
    try {
      const cookieHeader = await request.headers?.cookie;
      const refreshToken =
        cookieHeader
          ?.split(';')
          .map((data) => {
            if (data.split('RT=')) {
              return data.split('RT=')[1];
            }
          })
          .join('') ?? '';
      const data: { RT: string; AT: string; exp: number } =
        await this.accountsService.handleRefreshToken(refreshToken);
      return res
        .cookie('RT', data.RT, {
          httpOnly: true,
          sameSite: 'strict',
          maxAge: data.exp * 1000,
        })
        .status(200)
        .json({
          message: 'Refresh token successfully!',
          accessToken: data.AT,
          exp: process.env.JWT_AT_EXP_SECOND,
        });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @Post('signup')
  @HttpCode(200)
  async onSignUpAccount(@Body() createAccountDto: CreateAccountDto) {
    try {
      const { fullname, password, birthday, gender, phone, email } =
        createAccountDto;
      return await this.accountsService.handleCreateVerify({
        fullname,
        password,
        birthday,
        gender,
        phone,
        email,
      });
    } catch (err) {
      console.log(err);
      return new BadRequestException({
        message: 'Có lỗi sảy ra xin vui lòng thử lại sau.',
      });
    }
  }

  //Upload file image
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('uploads')
  onUploadFile(
    @Req() request,
    @UploadedFile()
    avatar?: Express.Multer.File,
  ) {
    try {
      const data = {
        file: avatar?.filename,
        message: 'Upload avatar successfully!',
      };
      return data;
    } catch (e) {
      throw new BadRequestException(
        request.fileValidator || 'File uploaded without image',
      );
    }
  }

  //Get image
  @Get('profile/:pathname')
  getImage(@Res() res: Response, @Param('pathname') pathname: string) {
    Logger.log('Get file image');
    res.sendFile(pathname, { root: './public/avatars' }, (err) => {
      if (err) {
        res.sendFile('avatar.jpg', { root: './public/avatars' });
      }
    });
  }

  @Get()
  @UseGuards(AuthGuard)
  async onFindOne(@Req() req) {
    // await this.accountsService.handleFindAll();
    return req.user;
  }

  @Post('permissions')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async onPermissions(@Body('access') access: any[], @Req() req) {
    try {
      const { id, ...args } = req.user;
      if (access.length === 0 && args) {
        return;
      } else {
        if (access && access.includes(args.roles)) {
          return;
        } else {
          throw new Error();
        }
      }
    } catch (e) {
      throw new NotFoundException({
        message: 'Bạn không có quyền truy cầp vào trang này!',
      });
    }
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async onGetInfoUser(@Req() req: any) {
    try {
      const { id, roles, description, ...args } = req.user;
      return { ...args, roles: description };
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Get('info')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async onGetThisInfoUser(@Req() req) {
    try {
      const { fullname, gender, phone, birthday, email, avatar, usid } =
        req.user;
      console.log(avatar);
      return { fullname, gender, phone, birthday, email, avatar, usid };
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  @Post('info')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async onUpdateThisInfoUser(
    @Req() req,
    @Body()
    updateAccountDto: UpdateMyAccountDto,
    @UploadedFile(new UploadImageValidationPipe()) avatar: Express.Multer.File,
  ) {
    const user = req.user;
    return await this.accountsService.handleUpdateThisInfoUser(
      user.id,
      updateAccountDto,
      avatar,
    );
  }

  @Get('users')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  @HttpCode(200)
  async onGetAllUsers(@Req() req) {
    try {
      const user = req.user;
      const data = await this.accountsService.handleFindAll(
        user.id,
        user.rating,
      );
      const count = await this.accountsService.handleFindAndCountUsers();
      const roleSet = await this.accountsService.handleGetRoleSet(user.rating);
      return { data, count, roleSet };
    } catch (e) {
      // console.log(e);
      throw new NotFoundException(e);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onDeleteOneUser(@Req() req, @Param('id') id: any) {
    try {
      const user = req.user;
      if (id == user.id) {
        throw new Error();
      }
      await this.accountsService.handleDelOneUser(id, user.rating);
      return { message: 'Xoá tài khoản thành công!' };
    } catch (e) {
      throw new NotFoundException({
        message: 'Xóa tài khoản thất bại!',
      });
    }
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async onLogout(@Req() request: any, @Res() response: Response) {
    try {
      const user = request.user;
      const result = await this.accountsService.handleLogout(user.id);
      return response.status(200).json(result);
    } catch (e) {
      throw new BadRequestException({
        message: 'Đăng xuất tài khoản thất bại!',
      });
    }
  }

  @Patch('ban/:id')
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onBanAccount(
    @Req() request,
    @Body() updateAccountDto: UpdateAccountDto,
    @Param('id') id: any,
  ) {
    try {
      const user = request.user;
      await this.accountsService.handleBanAccount(
        id,
        updateAccountDto.ban ?? true,
        user.roles.rating,
      );
      return {
        message: updateAccountDto.ban
          ? 'Khóa tài khoản thành công!'
          : 'Mở khóa tài khoản thành công!',
      };
    } catch (e) {
      throw new BadRequestException({
        message: updateAccountDto.ban
          ? 'Khóa tài khoản thất bại!'
          : 'Mở khóa tài khoản thất bại!',
      });
    }
  }

  @Patch('edit')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onUpdateInfoUser(
    @Req() request,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    try {
      const user = request.user;
      const { fullname, birthday, phone, email, gender, id } = updateAccountDto;
      if (!id) {
        throw new Error();
      }
      return await this.accountsService.handleUpdateInfoUser(
        id,
        { fullname, birthday, phone, email, gender },
        user.roles.rating,
      );
    } catch (e) {
      // console.log(e);
      throw new NotFoundException();
    }
  }

  @Post('')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @UserRoles([EnumRoles.CEO, EnumRoles.MANAGER])
  async onCreateAccount(@Body() createAccountDto: CreateAccountDto) {
    try {
      return await this.accountsService.handleCreateAccount(
        createAccountDto,
        true,
      );
    } catch (err) {
      throw new BadRequestException({
        message: 'Có lỗi xảy ra xin vui lòng thử lại sau.',
      });
    }
  }
  @Get('test')
  async onGetAll() {
    return { message: 'Hello world' };
  }

  @Post('forget')
  @HttpCode(200)
  async onCreateVerifyForgetPass(@Body() forgetAccountDto: ForgetAccountDto) {
    try {
      const result =
        await this.accountsService.handleCreateVerifyForgetPass(
          forgetAccountDto,
        );
      return result;
    } catch (err) {
      throw new HttpException(
        err?.message || 'Có lỗi xảy ra xin vui lòng thử lại sau.',
        err?.status || 404,
      );
    }
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async onChangePass(@Req() req, @Body() data: { pass: string }) {
    try {
      const user = req.user;
      const password = data.pass.split('</>+');
      const prevPass = password[0];
      const newPass = password[1];
      if (!prevPass || !newPass) {
        throw new Error();
      }
      return await this.accountsService.handleChangePass({
        id: user.id,
        prevPass,
        newPass,
      });
    } catch (e) {
      throw e;
    }
  }

  @Get('count')
  async onCountTotalAccounts() {
    return await this.accountsService.handleCountTotalAccounts();
  }
}
