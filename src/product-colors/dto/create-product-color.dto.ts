import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class CreateProductColorDto {
  @IsString()
  name: string;

  @IsString()
  @Length(7, 7)
  @Matches(/^#([A-Fa-f0-9]{6})$/, {
    message: 'hexCode must be a valid hex color code starting with #',
  })
  hexCode: string;
}
