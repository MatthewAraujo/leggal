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
@ApiBearerAuth()
@Controller('/tasks')
export class SuggestPriorityController {
  constructor(private suggestPriorityUseCase: SuggestPriorityUseCase) { }

  @Post('suggest-priority')
  @ApiOperation({ summary: 'Sugere a prioridade mais adequada para uma task' })
  @ApiBody({ type: SuggestPriorityDto })
  @ApiResponse({ status: 200, description: 'Prioridade sugerida', type: SuggestPriorityResponseDto })
  async handle(@Body(bodyValidationPipe) body: SuggestPriorityTaskBodySchema) {
    const { title, description } = body
    const priority = await this.suggestPriorityUseCase.execute({
      title,
      description,
    })

    return { priority }
  }
}

