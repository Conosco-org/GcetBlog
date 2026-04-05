# Implementation Questions - Contributor Drafts Management

## Summary of Understanding

Based on your requirements, here's what I understand:

### 1. Contributor Drafts Page Structure
Should have **3 tabs** (similar to Editor Review Queue):
- **Current Drafts**: Posts never submitted OR being revised (no editor feedback)
- **Requesting Changes**: Posts with editor feedback waiting for revision
- **Pending Review**: Posts submitted and waiting for editor review

Plus a **Rejected Posts section** showing deleted posts (from RejectionNotifications).

### 2. Post Status System
A post has **TWO status fields**:
- `_status`: Payload's draft/published state (controls website visibility)
- `reviewStatus`: Editorial workflow state (draft → pending_review → approved/rejected)

### 3. Key Changes Needed
1. Editor "Request Changes" should set `reviewStatus: 'draft'` (not 'rejected')
2. Contributors can delete their own drafts
3. Contributors can edit at any time (already implemented)
4. Remove "Mark as Read" from rejected posts (just show them)

## Questions for You

### Question 1: Contributor Delete Permissions
**When can contributors delete their own posts?**

Option A: Only when `reviewStatus: 'draft'`
- Can delete from "Current Drafts" tab
- Can delete from "Requesting Changes" tab
- CANNOT delete from "Pending Review" tab

Option B: Anytime except when published
- Can delete from all tabs including "Pending Review"

**My Recommendation**: Option A (safer, prevents accidental deletion during review)

### Question 2: Rejected Posts Display
**Should rejected posts (from RejectionNotifications) be shown in the Drafts page?**

Option A: Yes, show them in a separate section
- Read-only cards showing rejection reason
- No actions available (post is deleted)
- Just for historical reference

Option B: No, show them in a separate "Rejected Posts" page
- Keep drafts page clean
- Create new route `/contributor/rejected`

**My Recommendation**: Option A (keeps everything in one place)

### Question 3: Pending Review Actions
**What can contributors do with posts in "Pending Review"?**

Option A: View only (no edit, no delete)
- Prevents changes while editor is reviewing
- Contributor must wait for editor decision

Option B: Can withdraw submission
- Add "Withdraw" button to move back to "Current Drafts"
- Allows contributor to cancel review request

**My Recommendation**: Option A (cleaner workflow, prevents confusion)

### Question 4: Resubmit Behavior
**When contributor resubmits after "Requesting Changes", should it:**

Option A: Clear editor feedback
- `editorFeedback` field is cleared
- Fresh submission, no history

Option B: Keep editor feedback history
- `editorFeedback` stays but marked as "addressed"
- Shows revision history

**My Recommendation**: Option A (simpler, cleaner)

### Question 5: Tab Layout
**Should the tabs be:**

Option A: Horizontal tabs (like Editor Review Queue in screenshot)
```
[Current Drafts] [Requesting Changes] [Pending Review]
```

Option B: Vertical sections (like current implementation)
```
Current Drafts (3)
[cards...]

Requesting Changes (1)
[cards...]

Pending Review (2)
[cards...]
```

**My Recommendation**: Option A (matches Editor UI, more professional)

### Question 6: Notifications
**Should contributors be notified when:**
- Editor requests changes? (YES/NO)
- Editor approves post? (YES/NO)
- Editor rejects post? (YES/NO - already have RejectionNotifications)

**My Recommendation**: 
- Request Changes: YES (email + in-app)
- Approve: YES (email + in-app)
- Reject: Already handled by RejectionNotifications

### Question 7: Editor Feedback Display
**In "Requesting Changes" tab, how should editor feedback be shown?**

Option A: Inline in the card (like current implementation)
```
┌─────────────────────────────────┐
│ Post Title                      │
│ Last edited: 2 hours ago        │
│                                 │
│ ⚠️ Editor Feedback:             │
│ "Please add more details..."    │
│                                 │
│ [Edit] [Delete] [Resubmit]      │
└─────────────────────────────────┘
```

Option B: Expandable section
```
┌─────────────────────────────────┐
│ Post Title                      │
│ Last edited: 2 hours ago        │
│                                 │
│ [Show Feedback ▼]               │
│                                 │
│ [Edit] [Delete] [Resubmit]      │
└─────────────────────────────────┘
```

**My Recommendation**: Option A (more visible, harder to miss)

## Please Confirm

Please answer these questions so I can implement the solution correctly:

1. Delete permissions: **Option A or B?**
2. Rejected posts display: **Option A or B?**
3. Pending review actions: **Option A or B?**
4. Resubmit behavior: **Option A or B?**
5. Tab layout: **Option A or B?**
6. Notifications: **Which ones should be sent?**
7. Editor feedback display: **Option A or B?**

Once you confirm, I'll proceed with implementation and update all documentation.
