import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Task } from '@/domain/todo/enterprise/entities/task'
import { OpenAiService } from '@/infra/services/openai/openai.service'

interface GenerateTaskUseCaseRequest {
  text: string
}

type GenerateTaskUseCaseResponse = Either<
  null,
  {
    title: string,
    description: string
  }
>

@Injectable()
export class GenerateTaskUseCase {
  constructor(
    private readonly openaiService: OpenAiService,
  ) { }

  async execute({
    text
  }: GenerateTaskUseCaseRequest): Promise<GenerateTaskUseCaseResponse> {

    const openAiResponse = await this.openaiService.createCompletion(
      `Analyze this access request message and extract the project name and required AWS permissions. 
			Return a JSON object with "project" and "permissions" fields.
			Message: "${text}"

			Return only the json

			Example response format:
			{
				"title": ["s3:GetObject", "s3:ListBucket"]
				"description": "analytics-prod",
			}`
    )
    if (!openAiResponse) {
      throw new Error('No response from openai')
    }

    const parsedResponse = JSON.parse(openAiResponse)
    const title = parsedResponse.title
    const description = parsedResponse.description


    return right({
      title,
      description,
    })
  }
}
