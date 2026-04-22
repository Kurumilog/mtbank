import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'misha' })
  @IsString()
  @IsNotEmpty()
  login!: string;

  @ApiProperty({ example: 'Pass12345' })
  @IsString()
  @MinLength(6)
  password!: string;
}
