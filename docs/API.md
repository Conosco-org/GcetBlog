# API Reference

This document describes the API endpoints and data models for the GCET Blog platform.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`

## Authentication

Most API endpoints require authentication via JWT token stored in cookies.

### Login

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "role": "contributor"
  },
  "token": "jwt-token"
}
```

### Logout

```http
POST /api/users/logout
```

## Collections

### Posts

#### Get All Posts

```http
GET /api/posts?limit=10&page=1&where[status][equals]=published
```

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `page`: Page number (default: 1)
- `where`: Filter conditions
- `sort`: Sort field (e.g., `-createdAt` for descending)

**Response:**
```json
{
  "docs": [
    {
      "id": "post-id",
      "title": "Post Title",
      "content": {...},
      "status": "published",
      "author": "user-id",
      "institution": "institution-id",
      "createdAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "totalDocs": 100,
  "limit": 10,
  "page": 1,
  "totalPages": 10
}
```

#### Get Single Post

```http
GET /api/posts/:id
```

**Response:**
```json
{
  "id": "post-id",
  "title": "Post Title",
  "content": {...},
  "status": "published",
  "author": {
    "id": "user-id",
    "name": "Author Name"
  },
  "categories": [...],
  "createdAt": "2026-04-05T10:00:00.000Z"
}
```

#### Create Post

```http
POST /api/posts
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "New Post",
  "content": {...},
  "status": "draft",
  "categories": ["category-id"]
}
```

#### Update Post

```http
PATCH /api/posts/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "status": "published"
}
```

#### Delete Post

```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### Users

#### Get All Users (Admin Only)

```http
GET /api/users?limit=10&page=1
Authorization: Bearer <token>
```

#### Get Current User

```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Create User (Admin Only)

```http
POST /api/users
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "contributor",
  "name": "User Name",
  "institution": "institution-id"
}
```

#### Update User

```http
PATCH /api/users/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "bio": "User bio"
}
```

### Categories

#### Get All Categories

```http
GET /api/categories
```

#### Create Category (Editor/Admin)

```http
POST /api/categories
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Category Name",
  "slug": "category-slug",
  "description": "Category description"
}
```

### Media

#### Upload Media

```http
POST /api/media
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary-data>
alt: "Image description"
```

**Response:**
```json
{
  "id": "media-id",
  "url": "https://res.cloudinary.com/...",
  "alt": "Image description",
  "width": 1920,
  "height": 1080
}
```

#### Get All Media

```http
GET /api/media?limit=20&page=1
Authorization: Bearer <token>
```

### Comments

#### Get Comments for Post

```http
GET /api/comments?where[post][equals]=post-id
```

#### Create Comment

```http
POST /api/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "post": "post-id",
  "content": "Comment text",
  "parentComment": "parent-comment-id" // Optional for replies
}
```

#### Update Comment

```http
PATCH /api/comments/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "Updated comment"
}
```

#### Delete Comment

```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

### Votes

#### Vote on Post

```http
POST /api/votes
Content-Type: application/json
Authorization: Bearer <token>

{
  "post": "post-id",
  "voteType": "upvote" // or "downvote"
}
```

#### Get Vote Count

```http
GET /api/votes?where[post][equals]=post-id
```

### Templates

#### Get All Templates (Editor/Admin)

```http
GET /api/templates
Authorization: Bearer <token>
```

#### Create Template (Editor/Admin)

```http
POST /api/templates
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Template Name",
  "content": {...},
  "description": "Template description"
}
```

### Newsletter

#### Subscribe

```http
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "subscriber@example.com",
  "name": "Subscriber Name"
}
```

#### Unsubscribe

```http
POST /api/newsletter/unsubscribe
Content-Type: application/json

{
  "email": "subscriber@example.com"
}
```

#### Get Newsletters (Editor/Admin)

```http
GET /api/newsletters
Authorization: Bearer <token>
```

#### Create Newsletter (Editor/Admin)

```http
POST /api/newsletters
Content-Type: application/json
Authorization: Bearer <token>

{
  "subject": "Newsletter Subject",
  "content": {...},
  "scheduledFor": "2026-04-10T10:00:00.000Z"
}
```

## Custom API Routes

### Review Queue Actions

#### Submit Post for Review

```http
POST /api/posts/:id/submit-review
Authorization: Bearer <token>
```

#### Approve Post

```http
POST /api/posts/:id/approve
Authorization: Bearer <token>
```

#### Request Feedback

```http
POST /api/posts/:id/feedback
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Please revise the introduction"
}
```

#### Reject Post

```http
POST /api/posts/:id/reject
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Does not meet quality standards"
}
```

### Rejection Notifications

#### Get User's Rejection Notifications

```http
GET /api/rejection-notifications?where[contributor][equals]=user-id&where[isRead][equals]=false
Authorization: Bearer <token>
```

**Query Parameters:**
- `where[contributor][equals]`: Filter by contributor user ID
- `where[isRead][equals]`: Filter by read status (true/false)
- `sort`: Sort field (e.g., `-createdAt` for newest first)

**Response:**
```json
{
  "docs": [
    {
      "id": "notification-id",
      "postTitle": "My Rejected Post",
      "contributor": "user-id",
      "rejectedBy": "editor-id",
      "reason": "Does not meet quality standards",
      "originalPostId": "post-id",
      "isRead": false,
      "createdAt": "2026-04-05T10:00:00.000Z"
    }
  ],
  "totalDocs": 5,
  "limit": 10,
  "page": 1
}
```

#### Mark Rejection Notification as Read

```http
PATCH /api/rejection-notifications/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "isRead": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

**Note:** Contributors can only mark their own notifications as read. Editors and admins can mark any notification as read.

### Analytics

#### Get Post Views

```http
GET /api/page-views?where[post][equals]=post-id
Authorization: Bearer <token>
```

#### Track Page View

```http
POST /api/page-views
Content-Type: application/json

{
  "post": "post-id",
  "page": "/posts/post-slug"
}
```

## Data Models

### Post

```typescript
{
  id: string
  title: string
  slug: string
  content: RichText
  excerpt?: string
  featuredImage?: Media
  _status: 'draft' | 'published' | 'archived'
  reviewStatus: 'draft' | 'pending_review' | 'approved' | 'rejected'
  editorFeedback?: string
  submittedForReviewAt?: Date
  author: User
  categories: Category[]
  tags?: string[]
  institution: string
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  meta?: {
    title?: string
    description?: string
    image?: Media
  }
}
```

### User

```typescript
{
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'contributor' | 'user'
  institution: string
  avatar?: Media
  bio?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  createdAt: Date
  updatedAt: Date
}
```

### Category

```typescript
{
  id: string
  name: string
  slug: string
  description?: string
  parent?: Category
  institution: string
  createdAt: Date
  updatedAt: Date
}
```

### Media

```typescript
{
  id: string
  url: string
  alt?: string
  width?: number
  height?: number
  mimeType: string
  filesize: number
  filename: string
  institution: string
  uploadedBy: User
  createdAt: Date
  updatedAt: Date
}
```

### Comment

```typescript
{
  id: string
  post: Post
  author: User
  content: string
  parentComment?: Comment
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}
```

### Vote

```typescript
{
  id: string
  post: Post
  user: User
  voteType: 'upvote' | 'downvote'
  createdAt: Date
}
```

### Template

```typescript
{
  id: string
  name: string
  description?: string
  content: RichText
  institution: string
  createdBy: User
  createdAt: Date
  updatedAt: Date
}
```

### RejectionNotification

```typescript
{
  id: string
  postTitle: string
  contributor: User | string
  rejectedBy: User | string
  reason: string
  originalPostId: string
  isRead: boolean
  createdAt: Date
}
```

## Query Operators

### Comparison

- `equals`: Exact match
- `not_equals`: Not equal
- `greater_than`: Greater than
- `greater_than_equal`: Greater than or equal
- `less_than`: Less than
- `less_than_equal`: Less than or equal

### String

- `like`: Case-insensitive partial match
- `contains`: Contains substring
- `in`: Value in array
- `not_in`: Value not in array

### Logical

- `and`: All conditions must match
- `or`: Any condition must match

### Example Query

```http
GET /api/posts?where[and][0][status][equals]=published&where[and][1][author][equals]=user-id&sort=-createdAt&limit=10
```

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "message": "Validation error",
      "field": "title"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "errors": [
    {
      "message": "You must be logged in to access this resource"
    }
  ]
}
```

### 403 Forbidden

```json
{
  "errors": [
    {
      "message": "You are not allowed to perform this action"
    }
  ]
}
```

### 404 Not Found

```json
{
  "errors": [
    {
      "message": "The requested resource was not found"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "errors": [
    {
      "message": "An internal server error occurred"
    }
  ]
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1617235200
```

## Webhooks

Configure webhooks in Payload admin panel to receive notifications for:

- Post published
- User created
- Comment submitted
- Newsletter sent

Webhook payload:
```json
{
  "event": "post.published",
  "data": {
    "id": "post-id",
    "title": "Post Title"
  },
  "timestamp": "2026-04-05T10:00:00.000Z"
}
```

## Best Practices

1. **Use pagination**: Always use `limit` and `page` parameters
2. **Filter results**: Use `where` clauses to reduce payload size
3. **Select fields**: Use `select` parameter to return only needed fields
4. **Cache responses**: Cache GET requests when appropriate
5. **Handle errors**: Always handle error responses gracefully
6. **Respect rate limits**: Implement exponential backoff for retries

---

**Last Updated**: 2026-04-05  
**Maintained By**: GCET Development Team
