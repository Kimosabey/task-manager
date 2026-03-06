'use client'

import SwaggerUI from 'swagger-ui-react'

import 'swagger-ui-react/swagger-ui.css'
import '@/styles/swagger-overrides.css'

export function SwaggerUIClient() {
  return <SwaggerUI url="/swagger.json" />
}
