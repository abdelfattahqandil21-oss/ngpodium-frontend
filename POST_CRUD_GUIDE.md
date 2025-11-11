# 📝 Post CRUD Implementation Guide

## 🎯 Overview

Complete implementation of **Create, Read, Update, Delete** operations for posts with:
- ✅ Rich Text Editor (TipTap)
- ✅ Image Upload
- ✅ Tags Management
- ✅ Private Feed (My Posts)
- ✅ State Management with Signals

---

## 📦 Installation

### 1. Install TipTap Editor Dependencies

```bash
# TipTap Core & Extensions
npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-heading @tiptap/extension-code-block-lowlight @tiptap/extension-image @tiptap/extension-link

# Syntax Highlighting
npm install lowlight

# Note: Make sure to use lowlight v3.x or higher
# If you get import errors, try:
npm install lowlight@latest
```

### 2. Verify Angular Dependencies

```bash
# Should already be installed
npm install @angular/common @angular/core @angular/forms @angular/router
```

---

## 🏗️ Architecture

### **State Management Layer**
```
PostStateService (Signals-based)
    ├── CRUD Operations
    │   ├── createPost()
    │   ├── updatePost()
    │   ├── deletePost()
    │   └── getPostBySlug()
    ├── List Operations
    │   ├── loadPosts()
    │   ├── loadFeed()
    │   └── loadMyPosts()
    └── Filters & Pagination
        ├── search()
        ├── filterByTags()
        ├── sortBy()
        └── goToPage()
```

### **Component Layer**
```
WritePostPageComponent
    ├── RichEditorComponent (TipTap)
    ├── Image Upload
    ├── Form Validation
    └── Create/Edit Mode

FeedsPrivateComponent
    ├── My Posts List
    ├── Stats Dashboard
    ├── Pagination
    └── Delete Confirmation
```

---

## 🔧 Components

### 1. **WritePostPageComponent**

**Purpose:** Create and edit posts with rich text editor

**Features:**
- ✅ Rich text editing with TipTap
- ✅ Cover image upload
- ✅ Tags input (comma-separated)
- ✅ Auto-save draft (optional)
- ✅ Slug generation from title
- ✅ Form validation
- ✅ Edit mode detection from route

**Usage:**
```typescript
// Routes
{
  path: 'write-post',
  component: WritePostPageComponent
},
{
  path: 'post/:slug/edit',
  component: WritePostPageComponent
}
```

**Form Structure:**
```typescript
postForm = {
  title: string (required, min 3 chars),
  content: string (required, min 10 chars),
  coverImageData: string (base64),
  tags: string (comma-separated)
}
```

---

### 2. **RichEditorComponent**

**Purpose:** WYSIWYG editor for post content

**Features:**
- ✅ Bold, Italic formatting
- ✅ Headings (H1, H2)
- ✅ Code blocks with syntax highlighting
- ✅ Links
- ✅ Images
- ✅ Bullet/Ordered lists
- ✅ Character count
- ✅ Placeholder text

**API:**
```typescript
// Inputs
@Input() placeholder: string
@Input() disabled: boolean
@Input() initialContent: string

// Outputs
@Output() contentChange: EventEmitter<string>

// Public Methods
getContent(): string
setContent(html: string): void
clear(): void
focus(): void
```

**Usage:**
```html
<app-rich-editor
  [initialContent]="post.content"
  [placeholder]="'Write your post...'"
  (contentChange)="onContentChange($event)">
</app-rich-editor>
```

---

### 3. **FeedsPrivateComponent**

**Purpose:** Display user's own posts with management actions

**Features:**
- ✅ Stats dashboard (total, pages, per page)
- ✅ Posts list with cover images
- ✅ View/Edit/Delete actions
- ✅ Pagination
- ✅ Loading/Error/Empty states
- ✅ Create Post button

**Auto-loading:**
```typescript
ngOnInit() {
  const profile = this.authState.profile();
  if (profile?.id) {
    this.postState.loadMyPosts(profile.id);
  }
}
```

---

## 🔄 State Flow

### **Create Post Flow**

```
User fills form
    ↓
Submit button clicked
    ↓
Validate form
    ↓
Upload cover image (if exists)
    ↓
Generate slug from title
    ↓
Call postState.createPost()
    ↓
HTTP POST /api/v1/posts
    ↓
Optimistic UI update
    ↓
Navigate to post detail
```

### **Update Post Flow**

```
Load post by slug
    ↓
Populate form with existing data
    ↓
User edits
    ↓
Submit
    ↓
Call postState.updatePost(id, data)
    ↓
HTTP PATCH /api/v1/posts/:id
    ↓
Update in state
    ↓
Navigate to post detail
```

### **Delete Post Flow**

```
User clicks Delete
    ↓
Confirmation dialog
    ↓
Call postState.deletePost(id)
    ↓
HTTP DELETE /api/v1/posts/:id
    ↓
Remove from state immediately
    ↓
UI updates automatically
```

---

## 📡 API Integration

### **Endpoints Used**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/posts` | Create post | ✅ |
| GET | `/api/v1/posts/:slug` | Get single post | ❌ |
| PATCH | `/api/v1/posts/:id` | Update post | ✅ |
| DELETE | `/api/v1/posts/:id` | Delete post | ✅ |
| POST | `/api/v1/upload/cover` | Upload cover image | ✅ |
| GET | `/api/v1/posts?authorId=X` | Get user's posts | ❌ |

### **Request/Response Examples**

#### Create Post
```typescript
// Request
POST /api/v1/posts
{
  "slug": "my-first-post",
  "title": "My First Post",
  "content": "<p>Hello world!</p>",
  "coverImage": "/uploads/cover/abc123.jpg",
  "tags": ["angular", "typescript"]
}

// Response
{
  "id": 1,
  "slug": "my-first-post",
  "title": "My First Post",
  "content": "<p>Hello world!</p>",
  "coverImage": "/uploads/cover/abc123.jpg",
  "tags": ["angular", "typescript"],
  "author": {
    "id": 1,
    "username": "john",
    "image": "/uploads/profile/user.jpg"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Upload Cover Image
```typescript
// Request
POST /api/v1/upload/cover
Content-Type: multipart/form-data

file: [binary data]

// Response
{
  "url": "/uploads/cover/abc123.jpg"
}
```

---

## 🎨 UI/UX Features

### **Form Validation**
- ✅ Real-time validation
- ✅ Error messages below fields
- ✅ Disabled submit when invalid
- ✅ Mark all fields as touched on submit

### **Loading States**
- ✅ Spinner on submit button
- ✅ Disabled form during submission
- ✅ Loading indicator in lists

### **Error Handling**
- ✅ API error messages displayed
- ✅ Fallback to generic messages
- ✅ Console logging for debugging

### **Confirmation Dialogs**
- ✅ Unsaved changes warning
- ✅ Delete confirmation
- ✅ Cancel action confirmation

---

## 🔐 Security

### **Authentication**
- ✅ JWT token in HTTP headers
- ✅ Protected routes (create, edit, delete)
- ✅ Owner-only edit/delete

### **Validation**
- ✅ Frontend validation (Angular Forms)
- ✅ Backend validation (DTO)
- ✅ File type validation (images only)
- ✅ File size limit (5MB)

### **Authorization**
- ✅ User can only edit/delete own posts
- ✅ Backend checks authorId
- ✅ 403 Forbidden on unauthorized access

---

## 📝 Best Practices

### **1. Slug Generation**
```typescript
generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Multiple hyphens to one
    .trim();                        // Remove leading/trailing
}
```

### **2. Optimistic Updates**
```typescript
createPost(data) {
  return this.http.post(url, data).pipe(
    tap((newPost) => {
      // Update UI immediately
      this._posts.update(posts => [newPost, ...posts]);
      this._total.update(total => total + 1);
    })
  );
}
```

### **3. Error Recovery**
```typescript
deletePost(id) {
  return this.http.delete(url).pipe(
    tap(() => {
      // Remove from UI
      this._posts.update(posts => posts.filter(p => p.id !== id));
    }),
    catchError((error) => {
      // Show error, don't remove from UI
      this._error.set(error.message);
      throw error;
    })
  );
}
```

### **4. Form State Management**
```typescript
// Track dirty state
if (this.postForm.dirty) {
  confirm('Unsaved changes. Leave?');
}

// Mark all touched on submit
this.postForm.markAllAsTouched();

// Reset after success
this.postForm.reset();
```

---

## 🧪 Testing Checklist

### **Create Post**
- [ ] Form validation works
- [ ] Slug generated correctly
- [ ] Cover image uploads
- [ ] Tags parsed correctly
- [ ] Redirects to post detail
- [ ] Post appears in my posts

### **Edit Post**
- [ ] Loads existing post data
- [ ] Form pre-populated
- [ ] Updates save correctly
- [ ] Slug doesn't change
- [ ] Cover image can be changed

### **Delete Post**
- [ ] Confirmation dialog shows
- [ ] Post removed from list
- [ ] Total count decreases
- [ ] Can't delete others' posts

### **Rich Editor**
- [ ] All formatting buttons work
- [ ] Code blocks syntax highlight
- [ ] Images can be inserted
- [ ] Links can be added
- [ ] Character count updates

---

## 🚀 Deployment Checklist

### **Frontend**
- [ ] Install TipTap dependencies
- [ ] Configure routes
- [ ] Set environment variables
- [ ] Build for production
- [ ] Test all CRUD operations

### **Backend**
- [ ] Upload endpoint configured
- [ ] File storage setup
- [ ] JWT authentication working
- [ ] CORS configured
- [ ] Rate limiting enabled

---

## 🔧 Troubleshooting

### **Common Issues**

#### 1. `Cannot find module 'lowlight/lib/common'`

**Problem:** Old lowlight import path

**Solution:**
```typescript
// ❌ Old way (v2.x)
import { lowlight } from 'lowlight/lib/common';

// ✅ New way (v3.x)
import { common, createLowlight } from 'lowlight';
const lowlight = createLowlight(common);
```

#### 2. `Editor not rendering`

**Problem:** TipTap element not found

**Solution:**
```typescript
@ViewChild('editorElement', { static: true })
editorElement!: ElementRef<HTMLElement>;

ngOnInit() {
  // Make sure element exists before initializing
  if (this.editorElement?.nativeElement) {
    this.initializeEditor();
  }
}
```

#### 3. `Form not submitting`

**Problem:** Content not synced with form

**Solution:**
```typescript
onContentChange(content: string): void {
  // Manually update form control
  this.postForm.controls.content.setValue(content);
  this.postForm.controls.content.markAsTouched();
}
```

#### 4. `Image upload fails`

**Problem:** CORS or file size

**Solution:**
```typescript
// Check file size before upload
if (file.size > 5 * 1024 * 1024) {
  alert('Image size must be less than 5MB');
  return;
}

// Check file type
if (!file.type.startsWith('image/')) {
  alert('Please select an image file');
  return;
}
```

#### 5. `Infinite loop in feeds-private`

**Problem:** Using `effect()` with state updates

**Solution:**
```typescript
// ❌ Don't use effect for initial load
constructor() {
  effect(() => {
    const profile = this.authState.profile();
    if (profile?.id) {
      this.loadMyPosts(); // This causes infinite loop!
    }
  });
}

// ✅ Use ngOnInit instead
ngOnInit() {
  const profile = this.authState.profile();
  if (profile?.id) {
    this.loadMyPosts();
  }
}
```

---

## 📚 Additional Resources

### **TipTap Documentation**
- https://tiptap.dev/docs/editor/introduction
- https://tiptap.dev/docs/editor/extensions/starter-kit
- https://tiptap.dev/docs/editor/extensions/code-block-lowlight

### **Lowlight (Syntax Highlighting)**
- https://github.com/wooorm/lowlight
- https://www.npmjs.com/package/lowlight

### **Angular Forms**
- https://angular.dev/guide/forms/reactive-forms
- https://angular.dev/guide/forms/form-validation

### **Angular Signals**
- https://angular.dev/guide/signals
- https://angular.dev/guide/signals/rxjs-interop

---

## 🎉 Summary

تم إنشاء نظام CRUD كامل للمقالات مع:

✅ **Rich Text Editor** - محرر نصوص احترافي  
✅ **Image Upload** - رفع صور  
✅ **State Management** - إدارة حالة متقدمة  
✅ **Validation** - تحقق من البيانات  
✅ **Security** - حماية وصلاحيات  
✅ **UX** - تجربة مستخدم ممتازة  

**الكود جاهز للاستخدام! 🚀**
