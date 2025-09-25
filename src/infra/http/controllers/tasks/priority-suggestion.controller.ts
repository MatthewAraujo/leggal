import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  InternalServerErrorException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger'
import { z } from 'zod'
import { SuggestPriorityDto, SuggestPriorityResponseDto } from '../../dtos/task/suggest-priority.dto'
import { SuggestPriorityUseCase } from '@/domain/todo/application/use-cases/task/ia/suggest-priority'
import { OpenAiNoResponseError } from '@/domain/todo/application/use-cases/errors/openai-no-response-error'
import { InvalidOpenAiResponseError } from '@/domain/todo/application/use-cases/errors/invalid-openai-response-error'

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
  @ApiResponse({ status: 500, description: 'Erro interno do servidor - OpenAI indisponível' })
  async handle(@Body(bodyValidationPipe) body: SuggestPriorityTaskBodySchema) {
    const { title, description } = body
    const result = await this.suggestPriorityUseCase.execute({
      title,
      description,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case OpenAiNoResponseError:
          throw new InternalServerErrorException('OpenAI service is currently unavailable')
        case InvalidOpenAiResponseError:
          throw new InternalServerErrorException('Invalid response from OpenAI service')
        default:
          throw new BadRequestException()
      }
    }

    const { priority, reason } = result.value

    return { priority, reason }
  }
}

