# Post Rejection Workflow

This document explains what happens when an editor rejects a post in the GCET Blog platform.

## Overview

When an editor rejects a post, the system performs several actions to notify the author and maintain proper workflow state.

## Step-by-Step Process

### 1. Editor Action
- Editor accesses the Review Queue (`/editor/queue`)
- Finds a post with `reviewStatus: 'pending_review'`
- Clicks "Reject" button and optionally provides feedback

### 2. Server-Side Processing (`src/app/(frontend)/editor/queue/actions.ts`)

```typescript
export async function rejectPost(postId: string, reason?: string) {
  // 1. Authenticate editor
  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user || user.role !== 'editor') {
    throw new Error('Editor access required')
  }

  // 2. Update post status
  const updatedPost = await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      editorFeedback: reason || 'Post rejected by editor',
      reviewStatus: 'rejected',
      _status: 'draft', // Keep as draft
    },
    draft: true,
  })

  // 3. Create audit log
  await payload.create({
    collection: 'admin-logs',
    data: {
      action: 'reject_post',
      resourceType: 'posts',
      resourceId: postId,
      user: user.id,
      details: reason || 'Post rejected',
      timestamp: new Date().toISOString(),
    },
  })

  // 4. Revalidate cache
  revalidatePath('/editor/queue')
  revalidatePath('/editor')
  revalidatePath('/contributor/submissions')
}
```

### 3. Database Changes

The post document is updated with:
- `reviewStatus: 'rejected'`
- `editorFeedback: "Reason for rejection"`
- `_status: 'draft'` (remains unpublished)

### 4. What the Author Sees

#### In Contributor Dashboard (`/contributor/submissions`)
- Post appears with "Rejected" status badge (red)
- "Revise & Resubmit" button becomes available
- Editor feedback is visible in the post details

#### In Post Editor
- When author opens the rejected post for editing:
  - `editorFeedback` field shows the rejection reason
  - Post can be edited and resubmitted
  - `reviewStatus` will reset to `pending_review` on resubmission

### 5. Editor Dashboard Updates
- Post is removed from Review Queue
- Rejection is logged in Recent Activity
- Audit trail is created for accountability

## Field Visibility & Access Control

### `editorFeedback` Field
```typescript
{
  name: 'editorFeedback',
  type: 'textarea',
  admin: {
    condition: (data) => data._status === 'draft',
    description: 'Feedback from editor for rejected posts',
  },
  access: {
    read: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (['editor', 'admin'].includes(user.role)) return true
      // TODO: Add author check when we have proper author relationships
      return true
    },
    update: ({ req }) => {
      const user = req.user
      return user ? ['editor', 'admin'].includes(user.role) : false
    },
  },
}
```

### `reviewStatus` Field
```typescript
{
  name: 'reviewStatus',
  type: 'select',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Pending Review', value: 'pending_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ],
  access: {
    read: () => true, // Everyone can see status
    update: ({ req }) => {
      const user = req.user
      // Only editors and admins can change review status
      return user ? ['editor', 'admin'].includes(user.role) : false
    },
  },
}
```

## Author's Next Steps

### 1. View Rejection Feedback
- Author logs into `/contributor/submissions`
- Sees rejected post with red "Rejected" badge
- Clicks on post to view editor feedback

### 2. Revise the Post
- Clicks "Revise & Resubmit" button
- Opens post editor with feedback visible
- Makes necessary changes based on editor feedback

### 3. Resubmit for Review
- After making changes, author clicks "Submit for Review"
- Post status changes to `reviewStatus: 'pending_review'`
- `submittedForReviewAt` timestamp is updated
- Post re-enters the editor's review queue

## Audit Trail

Every rejection creates an audit log entry:
```typescript
{
  action: 'reject_post',
  resourceType: 'posts',
  resourceId: postId,
  user: editorId,
  details: rejectionReason,
  timestamp: '2025-03-23T10:30:00.000Z',
}
```

This provides:
- Full accountability of editorial decisions
- Tracking of rejection reasons
- Timeline of post review process
- Data for editorial analytics

## UI/UX Considerations

### Preview Banner
When viewing a rejected post in preview mode:
- Banner shows red background
- Message: "Your post was rejected - check editor feedback and revise before resubmitting"
- Clear indication of rejection status

### Status Badges
- **Draft**: Gray badge
- **Pending Review**: Orange badge
- **Approved**: Green badge
- **Rejected**: Red badge

### Notifications (Future Enhancement)
- Email notification to author when post is rejected
- In-app notification with rejection reason
- Reminder to revise and resubmit

## Database Queries

### Find Rejected Posts for Author
```typescript
const rejectedPosts = await payload.find({
  collection: 'posts',
  where: {
    and: [
      { authors: { contains: authorId } },
      { reviewStatus: { equals: 'rejected' } }
    ]
  }
})
```

### Find Posts Needing Revision
```typescript
const needsRevision = await payload.find({
  collection: 'posts',
  where: {
    and: [
      { reviewStatus: { equals: 'rejected' } },
      { editorFeedback: { exists: true } }
    ]
  }
})
```

## Analytics & Reporting

### Rejection Rate
```typescript
const totalSubmissions = await payload.count({
  collection: 'posts',
  where: { reviewStatus: { in: ['approved', 'rejected'] } }
})

const rejections = await payload.count({
  collection: 'posts',
  where: { reviewStatus: { equals: 'rejected' } }
})

const rejectionRate = (rejections.totalDocs / totalSubmissions.totalDocs) * 100
```

### Common Rejection Reasons
```typescript
const rejectionReasons = await payload.find({
  collection: 'admin-logs',
  where: { action: { equals: 'reject_post' } },
  select: { details: true }
})
```

## Best Practices

### For Editors
1. **Provide Clear Feedback**: Always include specific, actionable feedback
2. **Be Constructive**: Focus on how to improve, not just what's wrong
3. **Be Timely**: Review posts within 24-48 hours of submission
4. **Use Templates**: Create standard feedback templates for common issues

### For Authors
1. **Read Feedback Carefully**: Understand all points before revising
2. **Address All Issues**: Don't just fix one problem and resubmit
3. **Ask Questions**: Contact editors if feedback is unclear
4. **Learn from Rejections**: Use feedback to improve future submissions

## Common Rejection Reasons

1. **Content Quality**
   - Insufficient research or depth
   - Poor writing quality or grammar
   - Factual errors or outdated information

2. **SEO & Structure**
   - Missing or poor meta description
   - Inadequate headings structure
   - No featured image or poor image quality

3. **Compliance**
   - Doesn't match institution guidelines
   - Inappropriate content for target audience
   - Missing required disclosures or attributions

4. **Technical Issues**
   - Broken links or media
   - Formatting problems
   - Mobile responsiveness issues

## Recovery Process

### Automatic Recovery
- Post remains in author's drafts
- All content and media preserved
- Edit history maintained through Payload's versioning

### Manual Recovery
- Editors can "unreject" posts if needed
- Status can be changed back to `pending_review`
- Audit log tracks all status changes

## Integration Points

### Email Notifications (Future)
```typescript
// Send rejection notification
await sendEmail({
  to: authorEmail,
  subject: `Post Rejected: "${postTitle}"`,
  template: 'post-rejected',
  data: {
    postTitle,
    editorFeedback,
    revisionUrl: `/contributor/posts/${postId}/edit`
  }
})
```

### Slack/Discord Integration (Future)
```typescript
// Notify editorial team
await sendSlackMessage({
  channel: '#editorial',
  message: `📝 Post "${postTitle}" rejected by ${editorName}. Reason: ${editorFeedback}`
})
```

## Conclusion

The post rejection workflow ensures:
- Clear communication between editors and authors
- Proper audit trail for accountability
- Smooth revision and resubmission process
- Maintained content quality standards

Authors receive constructive feedback and can easily revise their work, while editors maintain control over content quality and publication standards.