import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import type { Express } from 'express'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudyHub API',
      version: '1.0.0',
      description: 'API for StudyHub — AI-powered ENT/IELTS preparation platform',
    },
    servers: [
      { url: '/api', description: 'API server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['student', 'parent', 'teacher', 'employer', 'admin'] },
            grade: { type: 'integer', nullable: true },
            city: { type: 'string', nullable: true },
            targetUniversity: { type: 'string', nullable: true },
            targetSpecialty: { type: 'string', nullable: true },
            isPremium: { type: 'boolean' },
            streak: { type: 'integer' },
            totalStudyMinutes: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ContentItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            data: { type: 'object' },
            active: { type: 'boolean' },
            order: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/ContentItem' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
      },
    },
    paths: {
      // ── Auth ──────────────────────────────────────────────────────────────
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'role'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    role: { type: 'string', enum: ['student', 'parent', 'teacher', 'employer'] },
                    grade: { type: 'integer' },
                    city: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'User created, returns JWT token and user object' },
            '400': { description: 'Validation error' },
            '409': { description: 'Email already registered' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Returns JWT token and user object' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Current user object' },
            '401': { description: 'Unauthorized' },
          },
        },
      },

      // ── Users ─────────────────────────────────────────────────────────────
      '/users/me': {
        put: {
          tags: ['Users'],
          summary: 'Update user profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    city: { type: 'string' },
                    grade: { type: 'integer' },
                    targetUniversity: { type: 'string' },
                    targetSpecialty: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Updated user' } },
        },
      },
      '/users/me/password': {
        post: {
          tags: ['Users'],
          summary: 'Change password',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string' },
                    newPassword: { type: 'string', minLength: 6 },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Password changed' }, '400': { description: 'Wrong current password' } },
        },
      },

      // ── Diagnostic ────────────────────────────────────────────────────────
      '/diagnostic/results': {
        post: {
          tags: ['Diagnostic'],
          summary: 'Save diagnostic test result',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Result saved' } },
        },
        get: {
          tags: ['Diagnostic'],
          summary: 'Get all user diagnostic results',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Array of diagnostic results' } },
        },
      },
      '/diagnostic/results/latest': {
        get: {
          tags: ['Diagnostic'],
          summary: 'Get latest diagnostic result',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Latest diagnostic result' } },
        },
      },

      // ── Study Plans ───────────────────────────────────────────────────────
      '/study-plans': {
        post: {
          tags: ['Study Plans'],
          summary: 'Create study plan',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Plan created' } },
        },
      },
      '/study-plans/active': {
        get: {
          tags: ['Study Plans'],
          summary: 'Get active study plan',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Active study plan' } },
        },
      },

      // ── ENT Results ───────────────────────────────────────────────────────
      '/ent-results': {
        post: {
          tags: ['ENT Results'],
          summary: 'Save ENT test result',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Result saved' } },
        },
        get: {
          tags: ['ENT Results'],
          summary: 'Get user ENT results',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Array of ENT results' } },
        },
      },

      // ── Content ───────────────────────────────────────────────────────────
      '/content': {
        get: {
          tags: ['Content'],
          summary: 'Get active content (public)',
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Content type filter' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 100 } },
          ],
          responses: { '200': { description: 'Paginated content items', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } } },
        },
        post: {
          tags: ['Content'],
          summary: 'Create content (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['type', 'data'],
                  properties: {
                    type: { type: 'string' },
                    data: { type: 'object' },
                    active: { type: 'boolean', default: true },
                    order: { type: 'integer', default: 0 },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Content created' } },
        },
      },
      '/content/all': {
        get: {
          tags: ['Content'],
          summary: 'Get all content (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          ],
          responses: { '200': { description: 'Paginated content items' } },
        },
      },
      '/content/{id}': {
        put: {
          tags: ['Content'],
          summary: 'Update content (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'Content updated' } },
        },
        delete: {
          tags: ['Content'],
          summary: 'Delete content (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Content deleted' } },
        },
      },

      // ── Courses ───────────────────────────────────────────────────────────
      '/courses': {
        get: {
          tags: ['Courses'],
          summary: 'Get all courses (public)',
          responses: { '200': { description: 'Array of courses' } },
        },
        post: {
          tags: ['Courses'],
          summary: 'Create course (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Course created' } },
        },
      },
      '/courses/{id}': {
        get: {
          tags: ['Courses'],
          summary: 'Get course by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Course details' } },
        },
        put: {
          tags: ['Courses'],
          summary: 'Update course (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'Course updated' } },
        },
        delete: {
          tags: ['Courses'],
          summary: 'Delete course (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Course deleted' } },
        },
      },
      '/courses/{id}/enroll': {
        post: {
          tags: ['Courses'],
          summary: 'Enroll in course',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Enrolled' } },
        },
      },
      '/courses/{id}/progress': {
        get: {
          tags: ['Courses'],
          summary: 'Get course progress',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Progress object' } },
        },
      },

      // ── Plans (pricing) ───────────────────────────────────────────────────
      '/plans': {
        get: {
          tags: ['Plans'],
          summary: 'Get pricing plans (public)',
          responses: { '200': { description: 'Array of plans' } },
        },
      },

      // ── Billing ───────────────────────────────────────────────────────────
      '/billing/my': {
        get: {
          tags: ['Billing'],
          summary: 'Get user subscription',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Subscription info' } },
        },
      },
      '/billing/stats': {
        get: {
          tags: ['Billing'],
          summary: 'Get billing stats (admin)',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Billing statistics' } },
        },
      },

      // ── KaspiPay ─────────────────────────────────────────────────────────
      '/billing/kaspi/create': {
        post: {
          tags: ['KaspiPay'],
          summary: 'Create KaspiPay payment order',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['planId'],
                  properties: {
                    planId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Payment link and QR data' },
            '503': { description: 'KaspiPay not configured' },
          },
        },
      },
      '/billing/kaspi/status/{orderId}': {
        get: {
          tags: ['KaspiPay'],
          summary: 'Check KaspiPay payment status',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Payment status' } },
        },
      },
      '/billing/kaspi/webhook': {
        post: {
          tags: ['KaspiPay'],
          summary: 'KaspiPay webhook callback',
          responses: { '200': { description: 'OK' } },
        },
      },

      // ── Admin ─────────────────────────────────────────────────────────────
      '/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Get platform statistics',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Platform stats (users, registrations, etc.)' } },
        },
      },

      // ── Admissions ────────────────────────────────────────────────────────
      '/admissions/deadlines': {
        get: {
          tags: ['Admissions'],
          summary: 'Get admission deadlines (public)',
          responses: { '200': { description: 'Array of deadlines' } },
        },
      },

      // ── Telegram ──────────────────────────────────────────────────────────
      '/telegram/webhook': {
        post: {
          tags: ['Telegram'],
          summary: 'Telegram bot webhook',
          responses: { '200': { description: 'OK' } },
        },
      },

      // ── Health ────────────────────────────────────────────────────────────
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Server is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' },
                      ts: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [], // We define everything inline above
}

const swaggerSpec = swaggerJsdoc(options)

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'StudyHub API Docs',
  }))
  app.get('/api/docs.json', (_req, res) => {
    res.json(swaggerSpec)
  })
}
