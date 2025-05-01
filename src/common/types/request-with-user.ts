// types/request-with-user.ts

import { Accounts } from 'src/accounts/entities/account.entity';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: Accounts;
}
