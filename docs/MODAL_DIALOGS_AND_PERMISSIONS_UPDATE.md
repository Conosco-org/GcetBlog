# Modal Dialogs and Permissions Update

## Overview

This update replaces browser alert/prompt windows with proper modal dialogs and fixes permission issues for admin users across the editor interface.

## Changes Made

### 1. Modal Dialog Components

Replaced all `window.prompt()` and `window.confirm()` calls with proper modal dialogs for better UX.

#### New Components Created

**FeedbackDialog** (`src/frontend/components/shared/FeedbackDialog.tsx`)
- Modal dialog for sending feedback to contributors
- Features:
  - Textarea input for detailed feedback
  - Loading states with spinner
  - Validation (prevents empty submissions)
  - Cancel and submit buttons
  - Proper error handling

**RejectDialog** (`src/frontend/components/shared/RejectDialog.tsx`)
- Modal dialog for rejecting posts with reasons
- Features:
  - Textarea input for rejection reason
  - Warning message for permanent deletions
  - Loading states
  - Validation
  - Differentiation between permanent and non-permanent rejections

#### Updated Components

**ApprovalButtons** (`src/app/(frontend)/editor/queue/ApprovalButtons.tsx`)
- "Feedback" button now opens FeedbackDialog
- "Reject" button now opens RejectDialog with permanent deletion warning
- Removed all `window.prompt()` and `window.confirm()` calls

**ContentManagerClient** (`src/app/(frontend)/editor/content/ContentManagerClient.tsx`)
- "Send Feedback" button now opens FeedbackDialog
- Uses same `requestChanges` action as Review Queue for consistency
- Unified feedback workflow across both interfaces

**CommentModerationView** (`src/app/(frontend)/editor/queue/CommentModerationView.tsx`)
- Comment rejection now uses AlertDialog instead of `window.confirm()`
- Proper confirmation UI with loading states

### 2. Admin Permission Fixes

Fixed permission checks across all API endpoints and server actions to allow admin access.

#### API Endpoints Updated

All endpoints now check for both 'editor' AND 'admin' roles:

- `/api/feedback/create` - Create feedback conversations
- `/api/categories/create` - Create categories
- `/api/categories/[id]` - Update/delete categories
- `/api/newsletter/subscribers/import` - Import subscribers
- `/api/newsletter/subscribers/export` - Export subscribers
- `/api/posts/with-pending-comments` - Get posts with pending comments

#### Server Actions Updated

- `approvePost()` - Approve and publish posts
- `requestChanges()` - Send feedback to contributors
- `deletePost()` - Reject and delete posts
- `unpublishPost()` - Unpublish posts
- `moderateComment()` - Approve/reject comments

### 3. Content Manager and Review Queue Separation

Clear separation of purposes between Content Manager and Review Queue.

#### Content Manager
- **Posts Tab**: Shows only published posts
- **Comments Tab**: Shows only approved comments
- **Badge Count**: Number of published posts
- **Purpose**: Manage live, published content

#### Review Queue
- **Post Approvals Tab**: Shows only posts from contributors with `pending_review` status
- **Comment Moderation Tab**: Shows only pending comments
- **Badge Count**: Number of pending posts (not including comments)
- **Purpose**: Review and moderate contributor submissions

#### Filtering Logic

**Content Manager** (`src/app/(frontend)/editor/content/page.tsx`)
```typescript
// Only published posts
where: { _status: { equals: 'published' } }

// Only approved comments
where: { status: { equals: 'approved' } }
```

**Review Queue** (`src/app/(frontend)/editor/queue/page.tsx`)
```typescript
// Only posts from contributors with pending_review status
where: {
  and: [
    { _status: { equals: 'draft' } },
    { reviewStatus: { equals: 'pending_review' } },
    { authors: { in: contributorIds } },
  ],
}

// Only pending comments
where: { status: { equals: 'pending' } }
```

### 4. Unified Feedback Workflow

Both Content Manager and Review Queue now use the same feedback mechanism.

**Workflow**:
1. Editor/Admin clicks "Send Feedback" or "Feedback" button
2. FeedbackDialog opens
3. Editor enters feedback message
4. System calls `requestChanges(postId, feedback)` action
5. Post updated with:
   - `editorFeedback`: feedback message
   - `reviewStatus`: 'requesting_changes'
   - `_status`: 'draft'
6. Post removed from both Content Manager and Review Queue
7. Post appears in contributor's drafts with feedback

### 5. Auto-Approve Admin/Editor Comments

Comments from privileged users are now automatically approved.

**Logic** (`src/app/(frontend)/posts/[slug]/actions.ts`):
```typescript
const userRole = user.role
const isAdmin = (user as unknown as { isAdmin?: boolean }).isAdmin === true
const commentStatus = (userRole === 'admin' || userRole === 'editor' || isAdmin) 
  ? 'approved' 
  : 'pending'
```

**Behavior**:
- Admin, editor, superadmin comments: Auto-approved, appear immediately
- Regular user comments: Pending status, require moderation

### 6. Pagination Default Changed

Default items per page changed from 20 to 10 across all editor pages.

**Updated Pages**:
- Content Manager: 10 items per page
- Review Queue: 10 items per page
- Activity Logs: 10 items per page

Users can still change to 20, 50, or 100 via the dropdown.

## Benefits

### User Experience
- Professional modal dialogs instead of browser alerts
- Better visual feedback with loading states
- Clearer separation between published and pending content
- Consistent feedback workflow across interfaces

### Admin Access
- Admins now have full access to all editor functionality
- No more "Editor access required" errors for admins
- Consistent permission checks across all endpoints

### Content Management
- Clear distinction between managing published content and reviewing submissions
- Badge counts accurately reflect pending work
- Auto-approved comments for staff reduce moderation overhead

## Migration Notes

No database migrations required. All changes are in the application layer.

## Testing Checklist

- [ ] Admin can send feedback from Content Manager
- [ ] Admin can send feedback from Review Queue
- [ ] Admin can approve/reject posts
- [ ] Admin can create/update/delete categories
- [ ] Admin comments appear immediately without moderation
- [ ] Editor comments appear immediately without moderation
- [ ] Regular user comments go to pending status
- [ ] Content Manager shows only published posts
- [ ] Review Queue shows only pending posts from contributors
- [ ] Badge counts are accurate
- [ ] Pagination defaults to 10 items
- [ ] All modal dialogs work correctly
- [ ] Feedback workflow updates post status correctly

## Files Changed

### New Files
- `src/frontend/components/shared/FeedbackDialog.tsx`
- `src/frontend/components/shared/RejectDialog.tsx`
- `docs/MODAL_DIALOGS_AND_PERMISSIONS_UPDATE.md`

### Modified Files
- `src/app/(frontend)/editor/queue/ApprovalButtons.tsx`
- `src/app/(frontend)/editor/content/ContentManagerClient.tsx`
- `src/app/(frontend)/editor/queue/CommentModerationView.tsx`
- `src/app/api/feedback/create/route.ts`
- `src/app/api/categories/[id]/route.ts`
- `src/app/api/categories/create/route.ts`
- `src/app/api/newsletter/subscribers/import/route.ts`
- `src/app/api/newsletter/subscribers/export/route.ts`
- `src/app/(payload)/api/posts/with-pending-comments/route.ts`
- `src/app/(frontend)/editor/queue/actions.ts`
- `src/app/(frontend)/editor/content/actions.ts`
- `src/app/(frontend)/posts/[slug]/actions.ts`
- `src/app/(frontend)/editor/content/page.tsx`
- `src/app/(frontend)/editor/queue/page.tsx`
- `src/app/(frontend)/editor/activity/page.tsx`
- `src/app/(frontend)/editor/layout.tsx`
- `src/frontend/features/editor/components/editor-layout-client.tsx`
- `src/frontend/features/editor/components/editor-sidebar.tsx`

## Version

Branch: `fix/replace-alerts-with-modals`
Date: 2026-04-18
