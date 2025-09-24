import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger'
import { z } from 'zod'
import { SuggestPriorityDto, SuggestPriorityResponseDto } from '../../dtos/task/suggest-priority.dto'
import { SuggestPriorityUseCase } from '@/domain/todo/application/use-cases/task/ia/suggest-priority'

const suggestpriorityTaskBodySchema = z.object({
  title: z.string(),
  description: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(suggestpriorityTaskBodySchema)
type SuggestPriorityTaskBodySchema = z.infer<typeof suggestpriorityTaskBodySchema>

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('/tasks')
export class SuggestPriorityController {
  constructor(private suggestPriorityUseCase: SuggestPriorityUseCase) { }

  @Post('suggest-priority')
  @ApiOperation({ summary: 'Sugerir prioridade adequada para uma tarefa' })
  @ApiBody({ type: SuggestPriorityDto })
  @ApiResponse({ status: 200, description: 'Prioridade sugerida com sucesso', type: SuggestPriorityResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async handle(@Body(bodyValidationPipe) body: SuggestPriorityTaskBodySchema) {
    const { title, description } = body
    const result = await this.suggestPriorityUseCase.execute({
      title,
      description,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const { priority } = result.value

    return { priority }
  }
}

