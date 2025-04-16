import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  avatar?: string;

  ban?: boolean;

  role_id?: number;

  refresh_token?: string;

  rolesID?: string[];
}
