import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'misha' })
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]{3,32}$/)
  login!: string;

  @ApiProperty({ example: 'Pass12345' })
  @IsString()
  @MinLength(6)
  password!: string;
}
