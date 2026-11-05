export const SAMPLE_DATASETS: Record<string, { title: string; filename: string; content: string }> = {
  order: {
    title: 'E-Commerce Order',
    filename: 'order.json',
    content: JSON.stringify(
      {
        orderId: 'ORD-98421-X',
        timestamp: '2025-02-23T14:32:00Z',
        status: 'PROCESSING',
        customer: {
          id: 'CUST-10492',
          name: 'Sarah Jenkins',
          email: 'sarah.j@example.com',
          vip: true,
          shippingAddress: {
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'IL',
            postalCode: '62704',
            country: 'USA',
          },
        },
        items: [
          {
            sku: 'TECH-PRO-4K',
            description: '4K Ultra HD Developer Monitor 32-inch',
            quantity: 2,
            unitPrice: 599.99,
            category: 'Electronics',
            tags: ['monitor', '4k', 'hardware'],
          },
          {
            sku: 'KEY-MECH-RGB',
            description: 'Ergonomic Mechanical Keyboard (Tactile Switches)',
            quantity: 1,
            unitPrice: 149.5,
            category: 'Peripherals',
            tags: ['keyboard', 'rgb'],
          },
        ],
        financials: {
          subtotal: 1349.48,
          tax: 107.96,
          shippingFee: 0.0,
          discountAmount: 50.0,
          totalAmount: 1407.44,
          currency: 'USD',
          paymentMethod: 'CreditCard',
        },
      },
      null,
      2
    ),
  },

  profile: {
    title: 'User Profile & Permissions',
    filename: 'user-profile.json',
    content: JSON.stringify(
      {
        userId: 'usr_78391283',
        username: 'alex_lead_arch',
        displayName: 'Alex Mercer',
        roles: ['Admin', 'Architect', 'SecurityAuditor'],
        metadata: {
          lastLogin: '2025-02-23T16:00:12Z',
          loginCount: 1420,
          ipAddress: '192.168.1.100',
          preferences: {
            theme: 'dark',
            fontSize: 14,
            autoSave: true,
            telemetry: false,
          },
        },
        teams: [
          { teamId: 't-core-engine', role: 'Lead', memberCount: 12 },
          { teamId: 't-cloud-ops', role: 'Advisor', memberCount: 8 },
        ],
      },
      null,
      2
    ),
  },

  geojson: {
    title: 'GeoJSON Spatial FeatureCollection',
    filename: 'spatial-data.geojson',
    content: JSON.stringify(
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-122.4194, 37.7749],
            },
            properties: {
              name: 'San Francisco Tech Hub',
              category: 'Office',
              capacity: 450,
            },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-122.42, 37.77],
                  [-122.41, 37.77],
                  [-122.41, 37.78],
                  [-122.42, 37.78],
                  [-122.42, 37.77],
                ],
              ],
            },
            properties: {
              name: 'Downtown District Zone A',
              restricted: false,
            },
          },
        ],
      },
      null,
      2
    ),
  },

  openapi: {
    title: 'OpenAPI 3.0 Spec Snippet',
    filename: 'api-spec.json',
    content: JSON.stringify(
      {
        openapi: '3.0.3',
        info: {
          title: 'JSONSpy Engine Gateway API',
          version: '1.0.0',
          description: 'High-throughput microservice for JSON parsing and schema transformation.',
        },
        paths: {
          '/api/v1/validate': {
            post: {
              summary: 'Validate JSON against Draft 2020-12 Schema',
              operationId: 'validateJsonPayload',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ValidationRequest',
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'Validation result payload',
                },
              },
            },
          },
        },
        components: {
          schemas: {
            ValidationRequest: {
              type: 'object',
              required: ['payload', 'schema'],
              properties: {
                payload: { type: 'object' },
                schema: { type: 'object' },
                strictMode: { type: 'boolean', default: true },
              },
            },
          },
        },
      },
      null,
      2
    ),
  },

  schema: {
    title: 'Sample JSON Schema (Draft 2020-12)',
    filename: 'order.schema.json',
    content: JSON.stringify(
      {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        title: 'Order',
        type: 'object',
        required: ['orderId', 'timestamp', 'status', 'customer', 'items'],
        properties: {
          orderId: {
            type: 'string',
            pattern: '^ORD-\\d{5}-[A-Z]$',
            description: 'Unique order identifier string format ORD-12345-X',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO-8601 UTC timestamp',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
          },
          customer: {
            type: 'object',
            required: ['id', 'name', 'email'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              vip: { type: 'boolean' },
            },
          },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['sku', 'quantity', 'unitPrice'],
              properties: {
                sku: { type: 'string' },
                description: { type: 'string' },
                quantity: { type: 'integer', minimum: 1 },
                unitPrice: { type: 'number', minimum: 0 },
              },
            },
          },
        },
      },
      null,
      2
    ),
  },

  broken: {
    title: 'Broken JSON (For SmartFix Demo)',
    filename: 'broken-sample.json',
    content: `{
  // Invalid JSON with multiple syntax errors!
  order_id: 'ORD-10023',
  customer: 'Jane Doe',
  is_active: True,
  amount: 249.99,
  /* Array with trailing comma and unquoted keys */
  tags: ['express', 'priority',],
  metadata: {
    undefined_field: undefined,
    nan_val: NaN,
  },
};`,
  },
};
