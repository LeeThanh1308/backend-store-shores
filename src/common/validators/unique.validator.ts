import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ async: true }) // Dùng async để kiểm tra trong DB
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments) {
    const [entity, field] = args.constraints; // Lấy entity và field
    const repo = this.dataSource.getRepository(entity);
    const record = await repo.findOne({
      where: { [field]: value },
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
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entity, field],
      validator: IsUniqueConstraint,
    });
  };
}
