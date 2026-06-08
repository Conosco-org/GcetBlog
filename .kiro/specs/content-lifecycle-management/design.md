# Design Document: Content Lifecycle Management

## Overview

The Content Lifecycle Management System automates the maintenance of the review queue for a multi-tenant blog platform by automatically archiving old posts and deleting old comments based on configurable timeframes. The system provides manual operations for editors and admins to manage archived content and ensures contributors receive clear status messages about their content.

### Design Goals

1. **Automated Maintenance**: Reduce manual overhead by automatically removing stale content from the review queue
2. **Safety**: Provide a 30-day retention window for archived posts before permanent deletion
3. **Configurability**: Allow admins to customize lifecycle thresholds and schedules
4. **Transparency**: Provide clear status messages to contributors about content lifecycle events
5. **Reliability**: Ensure automated operations continue processing remaining items if individual operations fail

### Key Features

- **Automated comment deletion** based on configurable age threshold (default 60 days)
- **Automated post archiving** based on configurable age threshold (15 days, 1/2/3 months)
- **30-day retention period** for archived posts with restore capability
- **Automatic permanent deletion** of posts after 30 days in archive
- **Manual archive operations** (archive, restore, delete) for editors and admins
- **Admin configuration interface** for lifecycle settings
- **Role-based access control** restricting operations to authorized users
- **Status messages** for contributors showing lifecycle events

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Payload CMS Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────┐      ┌──────────────────────────┐   │
│  │ Scheduled Jobs    │      │  Collections             │   │
│  │                   │      │                          │   │
│  │ - lifecycle-      │──────│  - Posts                 │   │
│  │   maintenance     │      │  - Comments              │   │
│  │                   │      │  - ArchivedPosts         │   │
│  └───────────────────┘      └──────────────────────────┘   │
│                                                               │
│  ┌───────────────────┐      ┌──────────────────────────┐   │
│  │ API Endpoints     │      │  Globals                 │   │
│  │                   │      │                          │   │
│  │ - archivePost     │──────│  - LifecycleConfig       │   │
│  │ - restorePost     │      │                          │   │
│  │ - deleteArchived  │      └──────────────────────────┘   │
│  └───────────────────┘                                      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │             Access Control Layer                       │ │
│  │  - Admin: Configuration + All Operations               │ │
│  │  - Editor: Manual Operations Only                      │ │
│  │  - Contributor: Read Status Messages Only              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Automated Lifecycle Flow
```
Scheduled Job Trigger
    │
    ├─→ Comment Auto-Deletion
    │      ├─→ Query comments older than threshold
    │      ├─→ Delete each comment
    │      └─→ Log results
    │
    ├─→ Post Auto-Archive
    │      ├─→ Query posts older than threshold (if enabled)
    │      ├─→ Move to ArchivedPosts collection (limit 1000)
    │      ├─→ Set archive timestamp
    │      └─→ Log results
    │
    └─→ Archive Permanent Deletion
           ├─→ Query archived posts older than 30 days
           ├─→ Delete each archived post
           └─→ Log results
```

#### Manual Operations Flow
```
Editor/Admin Action
    │
    ├─→ Manual Archive
    │      ├─→ Validate user role
    │      ├─→ Verify post exists in review queue
    │      ├─→ Create ArchivedPost record
    │      ├─→ Update post status message
    │      └─→ Return success/error
    │
    ├─→ Restore from Archive
    │      ├─→ Validate user role
    │      ├─→ Verify post in archive < 30 days
    │      ├─→ Move back to review queue
    │      ├─→ Reset age reference timestamp
    │      ├─→ Clear archive timestamp
    │      └─→ Return success/error
    │
    └─→ Delete Archived
           ├─→ Validate user role
           ├─→ Verify post exists in archive
           ├─→ Permanently delete
           ├─→ Update post status message
           └─→ Return success/error
```

## Components and Interfaces

### 1. ArchivedPosts Collection

A new Payload CMS collection to store archived posts separately from the active review queue.

**Fields:**
- `postId` (relationship to Posts): Reference to the original post
- `postTitle` (text): Denormalized post title for display
- `contributor` (relationship to Users): Post author
- `archivedAt` (date): Timestamp when archived
- `archivedBy` (relationship to Users, optional): User who archived (null for automated)
- `archiveReason` (select): "automated" | "manual"
- `originalCreatedAt` (date): Original post creation date
- `reviewStatus` (text): Review status at time of archiving

**Access Control:**
- Create: System only (via API endpoints)
- Read: Editors and admins only
- Update: System only
- Delete: Editors and admins only

**Indexes:**
- `archivedAt` (for efficient 30-day deletion queries)
- `postId` (for lookups)

### 2. LifecycleConfig Global

A Payload CMS global configuration object for lifecycle settings.

**Fields:**
- `commentDeletionThreshold` (number): Days before comment deletion (1-3650, default 60)
- `postArchiveThreshold` (select): "15-days" | "30-days" | "60-days" | "90-days" (default "60-days")
- `autoArchiveEnabled` (checkbox): Enable/disable auto-archive (default true)
- `jobSchedule` (select): "hourly" | "daily" | "weekly" | "monthly" (default "daily")

**Access Control:**
- Read: Admins only
- Update: Admins only

**Validation:**
- `commentDeletionThreshold`: 1 ≤ value ≤ 3650
- `postArchiveThreshold`: Must be one of allowed values
- `jobSchedule`: Must be one of allowed values

### 3. Posts Collection Updates

**New Fields:**
- `statusMessage` (textarea): Message displayed to contributor about post status
- `postAgeReferenceTimestamp` (date): Timestamp used for age calculations (initially createdAt, reset on restore)
- `archivedStatus` (select): "active" | "archived" | "deleted" (default "active")

**Field Updates:**
- `reviewStatus` field remains unchanged (draft, pending_review, requesting_changes, approved, rejected)

### 4. Lifecycle Job Handler

**Function:** `lifecycleMaintenanceJob()`

**Responsibilities:**
1. Execute comment auto-deletion
2. Execute post auto-archive (if enabled)
3. Execute archive permanent deletion
4. Log all operations with counts

**Implementation Pattern:**
```typescript
export const lifecycleMaintenanceJob = async (): Promise<{ output: string }> => {
  const startTime = new Date().toISOString()
  const results = {
    commentsDeleted: 0,
    postsArchived: 0,
    archivesDeleted: 0,
    errors: []
  }

  // 1. Comment Auto-Deletion
  // 2. Post Auto-Archive (if enabled)
  // 3. Archive Permanent Deletion

  return {
    output: `Lifecycle maintenance completed: ${results.commentsDeleted} comments deleted, ${results.postsArchived} posts archived, ${results.archivesDeleted} archives deleted`
  }
}
```

### 5. API Endpoints

#### POST /api/lifecycle/archive-post
**Purpose:** Manually archive a post  
**Access:** Editors and admins only  
**Input:** `{ postId: string }`  
**Output:** `{ success: boolean, message: string }`

#### POST /api/lifecycle/restore-post
**Purpose:** Restore an archived post to review queue  
**Access:** Editors and admins only  
**Input:** `{ postId: string }`  
**Output:** `{ success: boolean, message: string }`

#### DELETE /api/lifecycle/delete-archived
**Purpose:** Permanently delete an archived post  
**Access:** Editors and admins only  
**Input:** `{ postId: string }`  
**Output:** `{ success: boolean, message: string }`

### 6. Admin Configuration Interface

**Location:** Custom admin panel component  
**Access:** Admins only (403 for non-admins)

**Components:**
- Form inputs for all LifecycleConfig fields
- Validation error display
- Success confirmation messages
- Real-time schedule preview

### 7. Archive Management Interface

**Location:** Custom admin panel component  
**Access:** Editors and admins only

**Features:**
- List all archived posts with timestamps
- Sort by archive date (descending)
- Display days remaining before permanent deletion
- Restore button (disabled if > 30 days)
- Delete button with confirmation

## Data Models

### ArchivedPosts Collection Schema

```typescript
{
  slug: 'archived-posts',
  fields: [
    {
      name: 'postId',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true
    },
    {
      name: 'postTitle',
      type: 'text',
      required: true
    },
    {
      name: 'contributor',
      type: 'relationship',
      relationTo: 'users',
      required: true
    },
    {
      name: 'archivedAt',
      type: 'date',
      required: true,
      index: true
    },
    {
      name: 'archivedBy',
      type: 'relationship',
      relationTo: 'users'
    },
    {
      name: 'archiveReason',
      type: 'select',
      options: ['automated', 'manual'],
      required: true
    },
    {
      name: 'originalCreatedAt',
      type: 'date',
      required: true
    },
    {
      name: 'reviewStatus',
      type: 'text',
      required: true
    }
  ]
}
```

### LifecycleConfig Global Schema

```typescript
{
  slug: 'lifecycle-config',
  fields: [
    {
      name: 'commentDeletionThreshold',
      type: 'number',
      required: true,
      defaultValue: 60,
      min: 1,
      max: 3650
    },
    {
      name: 'postArchiveThreshold',
      type: 'select',
      required: true,
      defaultValue: '60-days',
      options: [
        { label: '15 Days', value: '15-days' },
        { label: '30 Days (1 month)', value: '30-days' },
        { label: '60 Days (2 months)', value: '60-days' },
        { label: '90 Days (3 months)', value: '90-days' }
      ]
    },
    {
      name: 'autoArchiveEnabled',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'jobSchedule',
      type: 'select',
      required: true,
      defaultValue: 'daily',
      options: [
        { label: 'Hourly', value: 'hourly' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' }
      ]
    }
  ]
}
```

### Posts Collection Updates

```typescript
// Add these fields to existing Posts collection
{
  name: 'statusMessage',
  type: 'textarea',
  admin: {
    readOnly: true,
    description: 'Status message for contributor'
  }
},
{
  name: 'postAgeReferenceTimestamp',
  type: 'date',
  required: true,
  defaultValue: () => new Date(),
  admin: {
    readOnly: true,
    description: 'Reference timestamp for age calculations'
  }
},
{
  name: 'archivedStatus',
  type: 'select',
  defaultValue: 'active',
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' },
    { label: 'Deleted', value: 'deleted' }
  ],
  admin: {
    readOnly: true
  }
}
```

### Status Message Templates

**Archived Message:**
```
"Archived: Your post has been moved to the archive as it exceeded the review queue retention period. It will be retained for 30 days for editorial review."
```

**Deleted Message:**
```
"Removed: Your post has been permanently removed from the archive after the retention period. Thank you for your contribution."
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Configuration Validation

*For any* configuration value for Comment_Deletion_Threshold, the system SHALL accept values in the range [1, 3650] inclusive and reject values outside this range.

**Validates: Requirements 1.2, 6.6**

### Property 2: Comment Age-Based Query Accuracy

*For any* set of comments with varying creation timestamps, when querying for comments exceeding the Comment_Deletion_Threshold, the system SHALL return exactly those comments whose age (calculated as the difference in days between creation timestamp and current time) exceeds the threshold.

**Validates: Requirements 1.4, 1.5**

### Property 3: Comment Deletion Completion

*For any* set of comments identified for deletion, when the deletion operation executes, all identified comments SHALL be permanently removed from the database.

**Validates: Requirements 1.6, 1.8**

### Property 4: Post Age Calculation Initialization

*For any* newly created post, the system SHALL set the Post_Age_Reference_Timestamp to equal the post's creation timestamp.

**Validates: Requirements 2.6**

### Property 5: Post Age-Based Archive Query Accuracy

*For any* set of posts with varying Post_Age_Reference_Timestamps, when querying for posts exceeding the Post_Archive_Threshold (while auto-archive is enabled), the system SHALL return up to 1000 posts whose age (calculated as the difference in days between Post_Age_Reference_Timestamp and current time) exceeds the threshold, ordered by age descending (oldest first).

**Validates: Requirements 2.4, 2.5**

### Property 6: Post Archiving Completion

*For any* post moved to the archive, the system SHALL create a corresponding ArchivedPost record with the current UTC timestamp AND remove the post from the Review_Queue.

**Validates: Requirements 2.7, 2.8, 2.9**

### Property 7: Archived Post Age-Based Query Accuracy

*For any* set of archived posts with varying archive timestamps, when querying for posts eligible for permanent deletion, the system SHALL return exactly those archived posts whose archive timestamp is greater than or equal to 720 hours (30 days) before the current time.

**Validates: Requirements 3.2**

### Property 8: Archived Post Deletion Completion

*For any* set of archived posts identified for permanent deletion, when the deletion operation executes, all identified posts SHALL be permanently removed from the database.

**Validates: Requirements 3.3**

### Property 9: Manual Archive Operation Correctness

*For any* post in the review queue, when a user with Admin or Editor role manually archives it, the system SHALL create an ArchivedPost record with the current UTC timestamp AND mark the archive reason as "manual".

**Validates: Requirements 5.3**

### Property 10: Archive View Sort Order

*For any* set of archived posts, when the archive view is requested by a user with Admin or Editor role, the system SHALL return all archived posts sorted in descending order by archive timestamp (most recent first).

**Validates: Requirements 5.5**

### Property 11: Restore Operation Correctness

*For any* archived post less than 30 days old, when a user with Admin or Editor role restores it, the system SHALL move the post back to the Review_Queue AND remove the archive timestamp AND reset the Post_Age_Reference_Timestamp to the current time.

**Validates: Requirements 5.9**

### Property 12: Permanent Delete Operation Correctness

*For any* archived post, when a user with Admin or Editor role permanently deletes it, the system SHALL remove that post from the database.

**Validates: Requirements 5.13**

### Property 13: Configuration Persistence

*For any* valid configuration change made by an Admin, when the configuration is saved, the system SHALL persist the new value such that subsequent configuration reads return the updated value.

**Validates: Requirements 6.9**

### Property 14: Archive Status Message Setting

*For any* post that is moved to the archive (either automatically or manually), the system SHALL set the statusMessage field to "Archived: Your post has been moved to the archive as it exceeded the review queue retention period. It will be retained for 30 days for editorial review."

**Validates: Requirements 8.1**

### Property 15: Deletion Status Message Setting

*For any* archived post that is permanently deleted (either automatically or manually), the system SHALL set the statusMessage field to "Removed: Your post has been permanently removed from the archive after the retention period. Thank you for your contribution."

**Validates: Requirements 8.2**

### Property 16: Status Message Persistence

*For any* post that has been archived or deleted, the system SHALL retain the statusMessage field value so that it remains accessible to the contributor even after the post is no longer in the active review queue.

**Validates: Requirements 8.5**

## Error Handling

### Batch Operation Error Resilience

**Principle:** Individual failures in batch operations (comment deletion, post archiving, archive deletion) SHALL NOT prevent processing of remaining items.

**Implementation:**
- Wrap each item operation in a try-catch block
- Log error details including item ID, error message, error code, and stack trace
- Continue processing remaining items in the batch
- Return summary of successes and failures

**Example:**
```typescript
async function deleteBatchComments(comments: Comment[]): Promise<BatchResult> {
  const results = { success: 0, failed: 0, errors: [] }
  
  for (const comment of comments) {
    try {
      await deleteComment(comment.id)
      results.success++
    } catch (error) {
      results.failed++
      results.errors.push({
        commentId: comment.id,
        error: error.message,
        stack: error.stack
      })
      // Log but continue
      logger.error(`Failed to delete comment ${comment.id}`, error)
    }
  }
  
  return results
}
```

### Manual Operation Error Handling

**Archive Operation Errors:**
- Post not found: Return `{ success: false, message: "Post not found in review queue" }`
- Database error: Return `{ success: false, message: "Failed to archive post" }` and leave post in queue
- Transaction rollback on failure to ensure consistency

**Restore Operation Errors:**
- Post not found: Return `{ success: false, message: "Post not found in archive" }`
- Post too old (≥30 days): Return `{ success: false, message: "Post cannot be restored after 30 days" }`
- Database error: Return `{ success: false, message: "Failed to restore post" }` and leave post in archive
- Transaction rollback on failure to ensure consistency

**Delete Operation Errors:**
- Post not found: Return `{ success: false, message: "Post not found in archive" }`
- Database error: Return `{ success: false, message: "Failed to delete post" }` and leave post in archive

### Configuration Validation Errors

**Validation Rules:**
- `commentDeletionThreshold`: Must be integer in range [1, 3650]
- `postArchiveThreshold`: Must be one of: "15-days", "30-days", "60-days", "90-days"
- `jobSchedule`: Must be one of: "hourly", "daily", "weekly", "monthly"

**Error Messages:**
- Out of range: "Comment deletion threshold must be between 1 and 3650 days"
- Invalid enum: "Post archive threshold must be one of: 15 days, 30 days, 60 days, 90 days"
- Type mismatch: "Invalid value type: expected number"

### Access Control Errors

**HTTP Status Codes:**
- 401 Unauthorized: User is not authenticated
  - Message: "Authentication required"
- 403 Forbidden: User lacks required role
  - For configuration: "Access denied: Admin role required"
  - For manual operations: "Access denied: Admin or Editor role required"

### Job Execution Errors

**Error Logging:**
- Job start time (ISO 8601 format)
- Operation type: "lifecycle_maintenance"
- Error message, error code, stack trace
- Job completion time (ISO 8601 format)
- Summary: comments deleted, posts archived, archives deleted

**Recovery:**
- Log error and continue with next operation in sequence
- Individual operation failures do not prevent subsequent operations
- Job completes even if some operations fail

## Testing Strategy

The Content Lifecycle Management System requires comprehensive testing across multiple layers to ensure correctness, reliability, and security.

### Unit Testing Approach

**Focus Areas:**
- Age calculation functions (comments and posts)
- Query logic for identifying eligible items
- Configuration validation
- Status message generation
- Timestamp management

**Example Unit Tests:**
- Comment age calculation with various timestamps
- Post age calculation with reference timestamp reset scenarios
- Configuration validation boundary cases (1, 3650, 0, 3651)
- Enum validation for thresholds and schedules
- Status message content verification
- Timestamp initialization on post creation

**Testing Framework:** Jest or Vitest (existing Next.js project standard)

### Property-Based Testing

This feature is well-suited for property-based testing because:
- Query logic operates over variable-size datasets with different ages
- Batch operations process multiple items with varying characteristics
- Age calculations work across a continuous time domain
- Manual operations should behave consistently regardless of specific post content

**Property-Based Testing Library:** fast-check for TypeScript/JavaScript

**Test Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: content-lifecycle-management, Property {N}: {property_text}`

**Key Properties to Test:**

1. **Property 1 (Configuration Validation):**
   - Generator: random integers
   - Test: values 1-3650 accepted, others rejected
   - Tag: `Feature: content-lifecycle-management, Property 1: Configuration Validation`

2. **Property 2 (Comment Age Query):**
   - Generator: arrays of comments with random creation dates
   - Test: query returns exactly those exceeding threshold
   - Tag: `Feature: content-lifecycle-management, Property 2: Comment Age-Based Query Accuracy`

3. **Property 3 (Comment Deletion):**
   - Generator: arrays of comments
   - Test: all identified comments removed from database
   - Tag: `Feature: content-lifecycle-management, Property 3: Comment Deletion Completion`

4. **Property 4 (Post Age Initialization):**
   - Generator: random post data
   - Test: reference timestamp equals creation timestamp
   - Tag: `Feature: content-lifecycle-management, Property 4: Post Age Calculation Initialization`

5. **Property 5 (Post Archive Query):**
   - Generator: arrays of posts with random reference timestamps
   - Test: query returns up to 1000 oldest posts exceeding threshold
   - Tag: `Feature: content-lifecycle-management, Property 5: Post Age-Based Archive Query Accuracy`

6. **Property 6 (Post Archiving):**
   - Generator: array of posts
   - Test: archived posts have ArchivedPost records and are removed from queue
   - Tag: `Feature: content-lifecycle-management, Property 6: Post Archiving Completion`

7. **Property 7 (Archive Age Query):**
   - Generator: arrays of archived posts with random archive dates
   - Test: query returns exactly those ≥30 days old
   - Tag: `Feature: content-lifecycle-management, Property 7: Archived Post Age-Based Query Accuracy`

8. **Property 8 (Archive Deletion):**
   - Generator: arrays of archived posts
   - Test: all identified posts removed from database
   - Tag: `Feature: content-lifecycle-management, Property 8: Archived Post Deletion Completion`

9. **Property 9 (Manual Archive):**
   - Generator: random posts
   - Test: manual archive creates ArchivedPost with "manual" reason
   - Tag: `Feature: content-lifecycle-management, Property 9: Manual Archive Operation Correctness`

10. **Property 10 (Archive View Sort):**
    - Generator: arrays of archived posts with random timestamps
    - Test: returned posts sorted descending by archive timestamp
    - Tag: `Feature: content-lifecycle-management, Property 10: Archive View Sort Order`

11. **Property 11 (Restore Operation):**
    - Generator: archived posts <30 days old
    - Test: restore moves to queue, clears archive timestamp, resets reference
    - Tag: `Feature: content-lifecycle-management, Property 11: Restore Operation Correctness`

12. **Property 12 (Permanent Delete):**
    - Generator: random archived posts
    - Test: delete removes from database
    - Tag: `Feature: content-lifecycle-management, Property 12: Permanent Delete Operation Correctness`

13. **Property 13 (Config Persistence):**
    - Generator: random valid configuration values
    - Test: saved config persists and is retrievable
    - Tag: `Feature: content-lifecycle-management, Property 13: Configuration Persistence`

14. **Property 14 (Archive Status Message):**
    - Generator: random posts
    - Test: archived posts have correct status message
    - Tag: `Feature: content-lifecycle-management, Property 14: Archive Status Message Setting`

15. **Property 15 (Delete Status Message):**
    - Generator: random archived posts
    - Test: deleted posts have correct status message
    - Tag: `Feature: content-lifecycle-management, Property 15: Deletion Status Message Setting`

16. **Property 16 (Status Persistence):**
    - Generator: random posts
    - Test: status message persists after archive/delete
    - Tag: `Feature: content-lifecycle-management, Property 16: Status Message Persistence`

### Integration Testing

**Focus Areas:**
- Job scheduling and execution
- Database transactions across collections
- API endpoint integration with authentication/authorization
- Configuration changes affecting job behavior

**Example Integration Tests:**
- Job executes all three operations in sequence
- Manual archive operation creates ArchivedPost and updates Posts
- Restore operation moves data between collections atomically
- Configuration changes apply to subsequent job runs
- Access control enforcement (401/403 responses)

### API Testing

**Endpoints to Test:**
- POST `/api/lifecycle/archive-post`
- POST `/api/lifecycle/restore-post`
- DELETE `/api/lifecycle/delete-archived`

**Test Scenarios:**
- Valid requests with proper authentication/authorization
- Invalid post IDs (404 responses)
- Unauthorized access (401/403 responses)
- Restore attempts on posts ≥30 days old
- Error handling and rollback on database failures

### Access Control Testing

**Test Matrix:**

| Role        | Config View | Config Edit | Archive | Restore | Delete |
|-------------|-------------|-------------|---------|---------|--------|
| Admin       | ✓           | ✓           | ✓       | ✓       | ✓      |
| Editor      | ✗           | ✗           | ✓       | ✓       | ✓      |
| Contributor | ✗           | ✗           | ✗       | ✗       | ✗      |
| User        | ✗           | ✗           | ✗       | ✗       | ✗      |
| Anonymous   | ✗           | ✗           | ✗       | ✗       | ✗      |

**Test Cases:**
- Verify each role can/cannot access each operation
- Verify correct HTTP status codes (401 vs 403)
- Verify error messages match requirements

### End-to-End Testing

**Workflow Tests:**
1. **Automated Lifecycle:**
   - Create comments/posts with old timestamps
   - Trigger job execution
   - Verify deletions and archiving occurred
   - Verify logs contain correct counts

2. **Manual Archive Workflow:**
   - Admin archives a post
   - Verify ArchivedPost created
   - Verify post removed from queue
   - Verify contributor sees status message

3. **Restore Workflow:**
   - Admin archives a post
   - Admin restores the post
   - Verify post back in queue
   - Verify reference timestamp reset
   - Verify post can be re-archived after threshold

4. **30-Day Retention:**
   - Archive posts
   - Simulate 30 days passing (adjust timestamps)
   - Trigger job execution
   - Verify permanent deletion occurred
   - Verify contributor can still see status message

### Performance Testing

**Load Scenarios:**
- Batch deletion of 10,000 comments
- Batch archiving of 1,000 posts (query limit)
- Query performance with 100,000 comments/posts
- Archive view with 1,000+ archived posts

**Performance Targets:**
- Comment deletion: < 10 seconds for 10,000 items
- Post archiving: < 5 seconds for 1,000 items
- Archive query: < 30 days old filter in < 1 second
- Manual operations: < 500ms response time

**Database Indexes Required:**
- Comments: `createdAt` (for age queries)
- Posts: `postAgeReferenceTimestamp`, `archivedStatus` (for age queries)
- ArchivedPosts: `archivedAt` (for 30-day queries), `postId` (for lookups)

### Test Data Management

**Generators:**
- Random comment data with varying ages
- Random post data with varying reference timestamps
- Random archived post data with varying archive dates
- Random user data with different roles

**Utilities:**
- Mock clock/time functions for deterministic age testing
- Test database seeding and cleanup
- Transaction rollback for test isolation

### CI/CD Integration

**Pre-commit:**
- Run unit tests
- Run linting

**Pull Request:**
- Run all unit tests
- Run property-based tests (100 iterations)
- Run integration tests
- Run API tests
- Check code coverage (target: >80%)

**Pre-deployment:**
- Run full test suite
- Run end-to-end tests
- Run performance tests
- Verify database indexes

## Implementation Checklist

### Phase 1: Data Layer
- [ ] Create ArchivedPosts collection
- [ ] Add fields to Posts collection (statusMessage, postAgeReferenceTimestamp, archivedStatus)
- [ ] Create LifecycleConfig global
- [ ] Add database indexes
- [ ] Create migration script for existing posts

### Phase 2: Core Logic
- [ ] Implement age calculation functions
- [ ] Implement comment deletion query and operation
- [ ] Implement post archiving query and operation
- [ ] Implement archive deletion query and operation
- [ ] Implement status message generation

### Phase 3: Scheduled Job
- [ ] Create lifecycle job handler
- [ ] Register job in Payload config
- [ ] Implement error handling and logging
- [ ] Test job execution

### Phase 4: API Endpoints
- [ ] Create archive-post endpoint
- [ ] Create restore-post endpoint
- [ ] Create delete-archived endpoint
- [ ] Implement access control middleware
- [ ] Implement error handling

### Phase 5: Admin Interface
- [ ] Create configuration UI component
- [ ] Create archive management UI component
- [ ] Implement role-based UI visibility
- [ ] Add form validation
- [ ] Add success/error messages

### Phase 6: Testing
- [ ] Write unit tests
- [ ] Write property-based tests (16 properties)
- [ ] Write integration tests
- [ ] Write API tests
- [ ] Write access control tests
- [ ] Write end-to-end tests
- [ ] Run performance tests

### Phase 7: Documentation
- [ ] Update API documentation
- [ ] Create admin user guide
- [ ] Document configuration options
- [ ] Document job scheduling
- [ ] Document database schema changes

### Phase 8: Deployment
- [ ] Run database migrations
- [ ] Deploy code changes
- [ ] Configure cron job
- [ ] Monitor initial job runs
- [ ] Verify logs and metrics
