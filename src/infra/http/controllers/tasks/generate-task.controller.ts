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
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { GenerateTaskDto } from '../../dtos/task/generate-task.dto'
import { GenerateTaskUseCase } from '@/domain/todo/application/use-cases/task/ia/generate'
import { TaskPresenter } from '../../presenters/task-presenter'

const generateTaskBodySchema = z.object({
  text: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(generateTaskBodySchema)
type GenerateTaskBodySchema = z.infer<typeof generateTaskBodySchema>

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('/tasks')
export class GenerateTaskController {
  constructor(private generateTask: GenerateTaskUseCase) { }

  @Post('generate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Gerar tarefa via IA a partir de texto' })
  @ApiBody({ type: GenerateTaskDto })
  @ApiResponse({ status: 201, description: 'Tarefa gerada e criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async handle(
    @Body(bodyValidationPipe) body: GenerateTaskBodySchema,
    @CurrentUser() user: UserPayload
  ) {
    const { text } = body
    const authorId = user.sub

    const result = await this.generateTask.execute({
      text,
      authorId

    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }


    const task = result.value.task

    return { tasks: TaskPresenter.toHTTP(task) }
  }
}
