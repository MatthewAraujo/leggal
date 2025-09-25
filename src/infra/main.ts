import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const configService = app.get(EnvService)
	const port = configService.get('PORT')

	const config = new DocumentBuilder()
		.setTitle('Leggal API')
		.setDescription('API para gerenciamento de tarefas e usuários')
		.setVersion('1.0')
		.addTag('auth', 'Endpoints de autenticação')
		.addTag('users', 'Endpoints de usuários')
		.addTag('tasks', 'Endpoints de tarefas')
		.addTag('health', 'Endpoints de health check')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'JWT',
				description: 'Enter JWT token',
				in: 'header',
			},
			'JWT-auth',
		)
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api', app, document, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	})

	await app.listen(port)
}
bootstrap()
