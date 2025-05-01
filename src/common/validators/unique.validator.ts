import { DataSource, Not } from 'typeorm';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: true }) // Dùng async để kiểm tra trong DB
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments) {
    const whereConditions: any = {};
    const [entity, field, id = 'id'] = args.constraints; // Lấy entity và field
    const thisObject = args.object;
    const valueFieldID = thisObject?.[id];
    if (valueFieldID) {
      whereConditions.id = Not(valueFieldID);
    }
    const repo = this.dataSource.getRepository(entity);
    const record = await repo.findOne({
      where: { [field]: value, ...whereConditions },
      select: ['id'],
    });
    return !record; // Nếu không có record nào trùng, thì hợp lệ
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} đã tồn tại!`;
  }
}

// Decorator sử dụng
export function IsUnique(
  entity: any,
  field: string,
  id?: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entity, field, id],
      validator: IsUniqueConstraint,
    });
  };
}
