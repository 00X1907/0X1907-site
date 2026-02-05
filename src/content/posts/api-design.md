---
id: api-design
title: RESTful API Design Guide
category: Backend
date: February 3, 2026
tags: API, REST, Design Patterns, Backend
---

Great APIs are invisible—they just work. Bad APIs create friction, bugs, and frustrated developers. This guide covers the principles that separate elegant APIs from frustrating ones.

![API Architecture](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=400&fit=crop)

## Resource Naming Conventions

URLs are your API's user interface. Make them intuitive.

:::note Golden Rule
Use nouns for resources, HTTP methods for actions. The URL describes WHAT, the method describes HOW.
:::

### URL Structure Examples

| Action | Bad | Good |
| --- | --- | --- |
| List users | GET /getUsers | GET /users |
| Get one user | GET /getUserById?id=5 | GET /users/5 |
| Create user | POST /createUser | POST /users |
| Update user | POST /updateUser | PUT /users/5 |
| Delete user | GET /deleteUser?id=5 | DELETE /users/5 |
| User's posts | GET /getPostsByUser | GET /users/5/posts |

```typescript
# filename: routes.ts
// Express route structure following REST conventions
import { Router } from 'express';

const router = Router();

// Collection routes
router.get('/users', listUsers);           // List all
router.post('/users', createUser);         // Create new
router.get('/users/:id', getUser);         // Get one
router.put('/users/:id', updateUser);      // Full update
router.patch('/users/:id', patchUser);     // Partial update
router.delete('/users/:id', deleteUser);   // Delete

// Nested resources
router.get('/users/:userId/posts', getUserPosts);
router.post('/users/:userId/posts', createUserPost);

// Actions as sub-resources (when CRUD doesn't fit)
router.post('/users/:id/activate', activateUser);
router.post('/orders/:id/cancel', cancelOrder);

export default router;
```

---

## HTTP Methods Deep Dive

Choose the right method for each operation:

| Method | Purpose | Idempotent | Safe | Request Body |
| --- | --- | --- | --- | --- |
| GET | Retrieve resources | Yes | Yes | No |
| POST | Create resource | No | No | Yes |
| PUT | Replace resource | Yes | No | Yes |
| PATCH | Partial update | Yes | No | Yes |
| DELETE | Remove resource | Yes | No | Optional |
| HEAD | Get headers only | Yes | Yes | No |
| OPTIONS | Get allowed methods | Yes | Yes | No |

:::tip PUT vs PATCH
**PUT** replaces the entire resource—missing fields become null. **PATCH** updates only provided fields—missing fields stay unchanged. Most "update" operations should use PATCH.
:::

```typescript
# filename: update-handlers.ts
// PUT - Full replacement (must send ALL fields)
app.put('/users/:id', async (req, res) => {
  const user = {
    id: req.params.id,
    name: req.body.name,           // Required
    email: req.body.email,         // Required  
    avatar: req.body.avatar,       // Becomes null if not sent
    preferences: req.body.preferences, // Becomes null if not sent
  };
  await db.users.replace(user);
  res.json(user);
});

// PATCH - Partial update (only send changed fields)
app.patch('/users/:id', async (req, res) => {
  const updates = {};
  
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.email !== undefined) updates.email = req.body.email;
  if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;
  
  const user = await db.users.update(req.params.id, updates);
  res.json(user);
});
```

---

## Status Codes That Make Sense

Status codes communicate intent. Use them correctly.

### Success Codes (2xx)

| Code | Meaning | When to Use |
| --- | --- | --- |
| 200 OK | Request succeeded | GET, PUT, PATCH with response body |
| 201 Created | Resource created | POST that creates a new resource |
| 204 No Content | Success, no body | DELETE, PUT/PATCH with no response |

### Client Error Codes (4xx)

| Code | Meaning | When to Use |
| --- | --- | --- |
| 400 Bad Request | Malformed request | Invalid JSON, missing fields |
| 401 Unauthorized | Not authenticated | Missing or invalid token |
| 403 Forbidden | Not authorized | Valid token, insufficient permissions |
| 404 Not Found | Resource doesn't exist | ID not in database |
| 409 Conflict | State conflict | Duplicate email, version mismatch |
| 422 Unprocessable | Validation failed | Valid JSON, invalid values |
| 429 Too Many Requests | Rate limited | Slow down requests |

:::warning Common Mistake
Don't use 200 for errors! `{ "status": 200, "error": "User not found" }` is an anti-pattern. Use proper status codes.
:::

```typescript
# filename: error-responses.ts
// Consistent error response structure
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// 400 - Bad Request
res.status(400).json({
  code: 'INVALID_REQUEST',
  message: 'Request body must be valid JSON',
});

// 401 - Unauthorized  
res.status(401).json({
  code: 'AUTHENTICATION_REQUIRED',
  message: 'Please provide a valid access token',
});

// 422 - Validation Error
res.status(422).json({
  code: 'VALIDATION_ERROR',
  message: 'Request validation failed',
  details: {
    email: ['Must be a valid email address'],
    age: ['Must be at least 18'],
  },
});
```

---

## Request & Response Design

Consistency is king. Define patterns and stick to them.

```typescript
# filename: response-patterns.ts
// Single resource response
interface SingleResponse<T> {
  data: T;
}

// Collection response with pagination
interface CollectionResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Example: GET /users
const response: CollectionResponse<User> = {
  data: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ],
  pagination: {
    page: 1,
    perPage: 20,
    total: 156,
    totalPages: 8,
  },
};

// Example: GET /users/1
const singleResponse: SingleResponse<User> = {
  data: { id: 1, name: 'Alice', email: 'alice@example.com' },
};
```

### Pagination Strategies

| Strategy | Pros | Cons | Best For |
| --- | --- | --- | --- |
| Offset | Simple, random access | Slow on large datasets | Small datasets |
| Cursor | Fast, consistent | No random access | Large datasets |
| Keyset | Very fast | Requires sorted field | Real-time feeds |

```typescript
# filename: pagination.ts
// Offset pagination (for smaller datasets)
// GET /users?page=2&perPage=20
app.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = Math.min(parseInt(req.query.perPage) || 20, 100);
  const offset = (page - 1) * perPage;
  
  const [users, total] = await Promise.all([
    db.users.findMany({ skip: offset, take: perPage }),
    db.users.count(),
  ]);
  
  res.json({
    data: users,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
});

// Cursor pagination (for large datasets)
// GET /users?cursor=abc123&limit=20
app.get('/users', async (req, res) => {
  const cursor = req.query.cursor;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  
  const users = await db.users.findMany({
    take: limit + 1, // Fetch one extra to check if more exist
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { id: 'asc' },
  });
  
  const hasMore = users.length > limit;
  const data = hasMore ? users.slice(0, -1) : users;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  
  res.json({
    data,
    pagination: {
      nextCursor,
      hasMore,
    },
  });
});
```

---

## Filtering, Sorting & Search

Give clients the power to query efficiently.

```typescript
# filename: query-parameters.ts
// GET /products?category=electronics&minPrice=100&maxPrice=500&sort=-price&fields=id,name,price

interface QueryParams {
  // Filtering
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: 'active' | 'inactive';
  
  // Sorting (prefix with - for descending)
  sort?: string;
  
  // Field selection
  fields?: string;
  
  // Search
  q?: string;
}

app.get('/products', async (req, res) => {
  const query = req.query as QueryParams;
  
  // Build filter
  const where: any = {};
  if (query.category) where.category = query.category;
  if (query.minPrice) where.price = { gte: query.minPrice };
  if (query.maxPrice) where.price = { ...where.price, lte: query.maxPrice };
  if (query.q) where.name = { contains: query.q, mode: 'insensitive' };
  
  // Build sort
  const orderBy: any = {};
  if (query.sort) {
    const desc = query.sort.startsWith('-');
    const field = desc ? query.sort.slice(1) : query.sort;
    orderBy[field] = desc ? 'desc' : 'asc';
  }
  
  // Build field selection
  const select = query.fields?.split(',').reduce((acc, field) => {
    acc[field.trim()] = true;
    return acc;
  }, {} as Record<string, boolean>);
  
  const products = await db.products.findMany({ where, orderBy, select });
  res.json({ data: products });
});
```

:::question Design Decision
Should filtering use query parameters (`?status=active`) or request body for POST endpoints? Query parameters are cacheable and bookmarkable, but have URL length limits. What would you choose for a complex search with 20+ filters?
:::

---

## Versioning Your API

APIs evolve. Version thoughtfully.

```typescript
# filename: versioning.ts
// Option 1: URL versioning (most common)
app.use('/v1/users', v1UserRoutes);
app.use('/v2/users', v2UserRoutes);

// Option 2: Header versioning (cleaner URLs)
app.use('/users', (req, res, next) => {
  const version = req.headers['api-version'] || '1';
  req.apiVersion = parseInt(version);
  next();
});

// Option 3: Accept header versioning
// Accept: application/vnd.myapi.v2+json
```

### Version Deprecation Strategy

1. Announce deprecation 6 months before removal
2. Add `Deprecation` header to responses
3. Include `Sunset` header with removal date
4. Log usage to identify affected clients
5. Provide migration guide

```typescript
# filename: deprecation-middleware.ts
function deprecationMiddleware(req, res, next) {
  // Mark API version as deprecated
  res.set('Deprecation', 'true');
  res.set('Sunset', 'Sat, 01 Jun 2026 00:00:00 GMT');
  res.set('Link', '</v2/docs>; rel="successor-version"');
  
  next();
}

app.use('/v1', deprecationMiddleware, v1Routes);
```

---

## Authentication Patterns

Secure your API without making it painful to use.

| Pattern | Use Case | Token Location |
| --- | --- | --- |
| API Key | Server-to-server | Header or query param |
| JWT Bearer | User sessions | Authorization header |
| OAuth 2.0 | Third-party access | Authorization header |
| Session Cookie | Browser apps | Cookie header |

```typescript
# filename: auth-middleware.ts
// JWT Bearer Token Authentication
import jwt from 'jsonwebtoken';

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'MISSING_TOKEN',
      message: 'Authorization header must be: Bearer <token>',
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 'TOKEN_EXPIRED',
        message: 'Access token has expired',
      });
    }
    return res.status(401).json({
      code: 'INVALID_TOKEN', 
      message: 'Access token is invalid',
    });
  }
}
```

![Security diagram](https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop)

---

## Rate Limiting

Protect your API from abuse and ensure fair usage.

```typescript
# filename: rate-limiter.ts
import rateLimit from 'express-rate-limit';

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Stricter limit for auth endpoints  
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    code: 'AUTH_RATE_LIMIT',
    message: 'Too many login attempts, please try again in an hour',
  },
});

app.use(globalLimiter);
app.use('/auth/login', authLimiter);
```

:::tip Rate Limit Headers
Always include these headers so clients can self-regulate:
- `X-RateLimit-Limit`: Max requests allowed
- `X-RateLimit-Remaining`: Requests left in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
:::

---

## API Documentation

Your API is only as good as its documentation.

```yaml
# filename: openapi.yaml
openapi: 3.0.0
info:
  title: User Management API
  version: 1.0.0
  description: API for managing users and their resources

paths:
  /users:
    get:
      summary: List all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: perPage
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
    post:
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: User created
        '422':
          description: Validation error
```

> "Documentation is a love letter that you write to your future self." — Damian Conway

---

## Checklist Before Launch

- Use HTTPS only (no HTTP)
- Implement proper CORS
- Validate all inputs
- Sanitize outputs to prevent XSS
- Add rate limiting
- Return consistent error format
- Document all endpoints
- Set up monitoring and logging
- Version your API from day one
- Write integration tests

:::note Final Thought
A well-designed API is a competitive advantage. It reduces support burden, accelerates integration, and makes developers want to use your product. Invest the time upfront.
:::
