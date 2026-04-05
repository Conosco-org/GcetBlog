# Changelog

All notable changes to the GCET Blog platform will be documented in this file.

## [Unreleased]

### Fixed - 2026-04-05

#### Contributors Can Now Edit and Delete Their Own Drafts

**Issues Resolved:**
1. **DELETE API Endpoint Missing**: Added DELETE method to `/api/posts/[id]/route.ts`
   - Contributors can delete their own unpublished posts (any reviewStatus except published)
   - Editors and admins can delete any post
   - Proper permission checks: author verification + published status check
   - Returns 403 if user is not the author or post is published
   - Revalidates contributor/drafts and editor/queue paths after deletion

2. **Edit Access Already Working**: Contributors can edit their own posts
   - `/editor/posts/[id]/edit` route checks author ownership for contributors
   - Editors have full access to all posts
   - Access control properly implemented in route

3. **Delete Button Now Functional**: UI delete button calls working API endpoint
   - Confirmation dialog with loading states
   - Toast notifications for success/error
   - Proper error handling and recovery
   - Page refreshes after successful deletion

**Technical Changes:**
- Added `DELETE` method to `src/app/api/posts/[id]/route.ts`
- Permission logic: 
  - Editors/admins: can delete any post
  - Contributors: can delete own posts only if `_status !== 'published'`
  - Includes all reviewStatus values: draft, pending_review, requesting_changes, rejected
- Regenerated Payload types to include `requesting_changes` status
- Added revalidation for `/contributor/drafts` and `/editor/queue` paths

**Files Modified:**
- `src/app/api/posts/[id]/route.ts` (added DELETE method)
- `src/payload-types.ts` (regenerated with requesting_changes status)

**Build Status:**
- ✅ Production build successful (61 pages)
- ✅ No TypeScript errors
- ✅ No linting issues
- ✅ All diagnostics passed

### Added - 2026-04-05

#### Contributor Drafts Management with Tabs

**New Features:**
- **Horizontal Tabs Layout**: Contributor drafts page now has 3 tabs (similar to Editor Review Queue)
  - **Current Drafts**: Posts never submitted OR being revised (no editor feedback)
  - **Requesting Changes**: Posts with editor feedback waiting for revision
  - **Pending Review**: Posts submitted and waiting for editor review
  
- **Delete Functionality**: Contributors can delete their own posts
  - Can delete from "Current Drafts" tab
  - Can delete from "Requesting Changes" tab
  - Can delete from "Pending Review" tab
  - CANNOT delete published posts
  - Confirmation dialog with loading states

- **Rejected Posts Section**: Shows deleted posts from RejectionNotifications
  - Read-only informational cards
  - Shows rejection reason and date
  - No "Mark as Read" button (just historical reference)

- **Editor Feedback Display**: Inline in cards with prominent styling
  - Orange/warning styling for posts with feedback
  - Yellow/pending styling for posts under review
  - Clear visual hierarchy

**Technical Improvements:**
- Created `contributorOwnNotPublished` access control
  - Prevents deleting published posts
  - Allows editors/admins to delete everything
  - Contributors can only delete their own unpublished posts
- Added `@radix-ui/react-tabs` component
- Created Tabs UI component with Radix primitives
- Updated drafts page query to include `pending_review` posts
- Delete API integration with confirmation dialog
- Proper error handling and toast notifications

**Workflow Changes:**
- Editor "Request Changes" sets `reviewStatus: 'draft'` (keeps post in database)
- Editor "Reject" deletes post permanently (creates RejectionNotification)
- Contributor can edit and resubmit after "Request Changes"
- Resubmit clears editor feedback for fresh submission

**Files Added:**
- `src/access/contributorOwnNotPublished.ts`
- `src/components/ui/tabs.tsx`
- `POST_STATUS_ANALYSIS.md` (documentation)
- `WORKFLOW_DIAGRAM.md` (documentation)
- `IMPLEMENTATION_QUESTIONS.md` (documentation)

**Files Modified:**
- `src/app/contributor/drafts/DraftsGridClient.tsx` (complete rewrite)
- `src/app/contributor/drafts/page.tsx`
- `src/collections/Posts/index.ts`
- `package.json` (added @radix-ui/react-tabs)

**Build Status:**
- ✅ Production build successful (61 pages)
- ✅ No TypeScript errors
- ✅ No linting issues
- ✅ All diagnostics passed

### Fixed - 2026-04-05

#### Critical Contributor Workflow Fixes

**Issues Resolved:**
1. **Save Draft Button Redirect**: Now properly redirects to `/contributor/drafts` after saving
   - Added router.push() and router.refresh() calls
   - Loading state persists until redirect completes
   - Consistent with "Submit for Review" behavior

2. **Send for Review Redirect**: Added router.refresh() to ensure submissions page updates
   - Submissions page now shows correct status immediately after submission
   - Proper revalidation of server-side data

3. **Drafts Page Organization**: Implemented 3 distinct sections
   - **Rejected Posts**: Posts with reviewStatus='rejected' (red styling)
   - **Requesting Changes**: Draft posts with editor feedback (orange styling)
   - **Current Drafts**: Regular drafts without feedback (neutral styling)
   - Each section shows count and appropriate styling

4. **Contributor Edit Access**: Contributors can now edit their own posts
   - Updated Posts collection access control from `editorOnly` to `contributorOwn`
   - Contributors can edit posts where they are listed as authors
   - Editors and admins retain full access

5. **Contributor Preview Access**: Contributors can preview their own posts
   - Access control allows contributors to view their authored posts
   - Preview functionality works for draft and submitted posts

6. **Drafts Page Data Fetching**: Now fetches both draft and rejected posts
   - Updated query to include `reviewStatus: 'rejected'` posts
   - Rejected posts appear in appropriate section with feedback

**Technical Changes:**
- `CreateContentForm.tsx`: Added redirect logic to handleSaveDraft()
- `CreateContentForm.tsx`: Added router.refresh() to handleSubmit()
- `DraftsGridClient.tsx`: Categorized posts into 3 sections with proper filtering
- `page.tsx` (drafts): Updated query to fetch draft AND rejected posts
- `Posts/index.ts`: Changed update access from `editorOnly` to `contributorOwn`
- `contributorOwn.ts`: Added admin role to access control

**Files Modified:**
- `src/app/contributor/create/CreateContentForm.tsx`
- `src/app/contributor/drafts/DraftsGridClient.tsx`
- `src/app/contributor/drafts/page.tsx`
- `src/collections/Posts/index.ts`
- `src/access/contributorOwn.ts`

**Build Status:**
- ✅ Production build successful (61 pages)
- ✅ No TypeScript errors
- ✅ No linting issues
- ✅ All diagnostics passed

### Added - 2026-04-05

#### Contributor & Editor Workflow with Loading States

**New Features:**
- **Loading States on All Action Buttons**: Prevents duplicate submissions across the platform
  - PostForm: "Submit for Review", "Save Draft", "Publish" buttons
  - ApprovalButtons: "Approve", "Request Changes", "Reject" buttons
  - CreateContentForm: All action buttons
  - Button text changes during actions ("Submitting...", "Saving...", "Approving...", etc.)
  - All buttons in a group disable when any action is in progress
  - Loading states clear on error, persist on success until page refresh

- **RejectionNotifications Collection**: New Payload CMS collection for tracking rejected posts
  - Fields: postTitle, contributor, rejectedBy, reason, originalPostId, isRead, createdAt
  - Access control: contributors can read their own, editors can read all
  - Displayed in contributor drafts page with red/destructive styling
  - Contributors can dismiss notifications (marks as read)

- **Organized Contributor Drafts**: Drafts page now has three sections
  - **Rejected Posts** (red styling): Shows rejection notifications with reasons
  - **Requesting Changes** (orange styling): Shows posts with editor feedback
  - **Current Drafts** (neutral styling): Regular drafts without feedback

- **Enhanced Editor Review Queue**:
  - Confirmation dialogs for destructive actions (reject)
  - All buttons disable during any action to prevent conflicts
  - Toast notifications for success and error feedback
  - Proper error handling and recovery

**Technical Improvements:**
- Separate loading states for each action (isSubmittingForReview, isSavingDraft, isPublishing)
- Computed isProcessing value to disable all buttons during any action
- Server actions with proper error handling and revalidation
- TypeScript type safety throughout
- Consistent toast notification patterns

**Files Added:**
- `src/collections/RejectionNotifications/index.ts`
- `src/app/contributor/drafts/actions.ts`
- `.kiro/specs/contributor-editor-workflow/` (spec documentation)

**Files Modified:**
- `src/app/(frontend)/editor/posts/create/PostForm.tsx`
- `src/app/(frontend)/editor/posts/[id]/edit/PostForm.tsx`
- `src/app/(frontend)/editor/queue/ApprovalButtons.tsx`
- `src/app/(frontend)/editor/queue/actions.ts`
- `src/app/(frontend)/contributor/drafts/page.tsx`
- `src/app/(frontend)/contributor/drafts/DraftsGridClient.tsx`
- `src/payload.config.ts`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DEVELOPMENT.md`

**Requirements Satisfied:**
- FR-1.1.1: Contributors can submit draft posts for editor review
- FR-1.1.2: Contributors can save posts as drafts
- FR-1.2.1: Editors can approve posts for publication
- FR-1.2.2: Editors can request changes to posts
- FR-1.2.3: Editors can reject and delete posts
- FR-1.3.1: Contributors are notified when posts are rejected
- FR-1.3.2: Contributors can dismiss rejection notifications
- FR-1.4.1: All action buttons prevent duplicate submissions
- FR-1.4.2: All buttons disabled when any action is in progress
- FR-1.5.1: Clear visual feedback for all actions
- FR-1.5.2: Contributor drafts organized into sections

**Build Status:**
- ✅ Production build successful
- ✅ No TypeScript errors
- ✅ No linting issues
- ✅ 61 pages compiled successfully

---

**Maintained By**: GCET Development Team
