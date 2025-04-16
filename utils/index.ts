import { BadRequestException } from '@nestjs/common';

export const handleRemoveMark = (text: string) => {
  return text
    ?.toLowerCase()
    ?.normalize('NFD')
    ?.replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
    ?.replace(/đ/g, 'd') // Chuyển "đ" thành "d"
    ?.trim(); // Xóa khoảng trắng đầu cuối
};

export const handleRegexSlug = (value) => {
  return value
    ?.toLowerCase()
    ?.normalize('NFD')
    ?.replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
    ?.replace(/đ/g, 'd') // Chuyển "đ" thành "d"
    ?.replace(/[^a-z0-9 -]/g, '') // Chỉ giữ lại chữ cái, số và dấu cách
    ?.replace(/\s+/g, '-') // Chuyển khoảng trắng thành "-"
    ?.replace(/-+/g, '-') // Xóa dấu "-" liên tiếp
    ?.trim(); // Xóa khoảng trắng đầu cuối
};
export const convertTextToLike = (text: string): string => {
  return `${handleRegexSlug(text).replaceAll('', '%')}`;
};

export const convertTextToLikeVi = (text: string): string => {
  return `${text.replaceAll('', '%')}`;
};
