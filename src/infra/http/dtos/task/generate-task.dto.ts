import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class GenerateTaskDto {
  @ApiProperty({
    description: 'Texto da tarefa',
    example: 'gostaria de estudar nestjs e fazer loucuras com meu conhecimento em backend',
  })
  @IsString()
  text!: string
}
