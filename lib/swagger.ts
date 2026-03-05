import { createSwaggerSpec } from 'next-swagger-doc'

export function getSwaggerSpec() {
  return createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Task Manager API',
        version: '1.0.0',
        description: 'Internal API for the startup task manager',
      },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  })
}
