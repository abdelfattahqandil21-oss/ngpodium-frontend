# 🖼️ Image Display Guide

## 📋 Overview

دليل شامل لكيفية عرض الصور في التطبيق بشكل صحيح في كل الأماكن.

---

## 🎯 الفكرة الأساسية

### **Backend:**
- بيرجع **relative path** فقط: `/uploads/cover/image.jpg`
- **لا** يرجع الـ domain: `http://localhost:3000`

### **Frontend:**
- بيضيف الـ **base URL** من `environment`
- النتيجة النهائية: `http://localhost:3000/uploads/cover/image.jpg`

---

## 🔧 Environment Configuration

### **`src/env/env.ts`**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  imgUrl: 'http://localhost:3000/uploads/',
  profile: 'http://localhost:3000/uploads/profile/',
  coverImg: 'http://localhost:3000/uploads/cover/'
};
```

### **`src/env/env.prod.ts`**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api/v1',
  imgUrl: 'https://cdn.yourdomain.com/uploads/',
  profile: 'https://cdn.yourdomain.com/uploads/profile/',
  coverImg: 'https://cdn.yourdomain.com/uploads/cover/'
};
```

---

## 📡 Backend Response Format

### **Upload Endpoint Response:**
```json
POST /api/v1/upload/cover

Response:
{
  "url": "/uploads/cover/my-post-1234567890.webp"
}
```

### **Post Object:**
```json
{
  "id": 1,
  "slug": "my-post",
  "title": "My Post",
  "coverImage": "/uploads/cover/my-post-1234567890.webp",
  "author": {
    "image": "/uploads/profile/user-123.jpg"
  }
}
```

**ملاحظة:** كل الـ paths نسبية (relative) بدون domain.

---

## 🎨 Frontend Display Patterns

### **Pattern 1: Post Cover Image**
```typescript
// Component
readonly coverImg = environment.coverImg;

// Template
@if (post.coverImage) {
  <img [src]="coverImg + post.coverImage" [alt]="post.title" />
}

// Result: http://localhost:3000/uploads/cover/image.jpg
```

### **Pattern 2: Author Profile Image**
```typescript
// Component
readonly profileImg = environment.profile;

// Template
<img [src]="profileImg + post.author.image" [alt]="author" />

// Result: http://localhost:3000/uploads/profile/user.jpg
```

### **Pattern 3: Generic Upload**
```typescript
// Component
readonly imgUrl = environment.imgUrl;

// Template
<img [src]="imgUrl + imagePath" />

// Result: http://localhost:3000/uploads/any-folder/image.jpg
```

---

## ✅ Components Checklist

### **1. Post Detail Component** ✅
```typescript
// post-detail.component.ts
readonly imgcovered = environment.coverImg;

// Template
@if (post()!.coverImage) {
  <img [src]="imgcovered + post()!.coverImage" />
}
```

### **2. Feeds Private Component** ✅
```typescript
// feeds-private.component.ts
readonly imgcovered = environment.coverImg;

// Template
@if (post.coverImage) {
  <img [src]="imgcovered + post.coverImage" />
}
```

### **3. Search Box Component** ✅
```typescript
// search-box.component.ts
readonly coverImg = environment.coverImg;

// Template
@if (post.coverImage) {
  <img [src]="coverImg + post.coverImage" />
}
```

### **4. Posts List Example** ✅
```typescript
// posts-list-example.component.ts
readonly coverImg = environment.coverImg;

// Template
@if (post.coverImage) {
  <img [src]="coverImg + post.coverImage" />
}
```

### **5. Write Post Page** ✅
```typescript
// write-post-page.component.ts
// For preview during edit
if (post.coverImage) {
  this.previewUrl.set(environment.coverImg + post.coverImage);
}
```

---

## 🔄 Upload Flow

### **Complete Flow:**

```
1. User selects image
    ↓
2. Convert to base64 for preview
    ↓
3. Display preview: this.previewUrl.set(dataUrl)
    ↓
4. On submit: Upload to backend
    POST /api/v1/upload/cover
    FormData: { file: File }
    ↓
5. Backend saves & returns
    Response: { url: "/uploads/cover/image.webp" }
    ↓
6. Use in post creation
    POST /api/v1/posts
    Body: { 
      title: "...",
      coverImage: "/uploads/cover/image.webp"  // ← Relative path
    }
    ↓
7. Display in UI
    <img [src]="coverImg + post.coverImage" />
    Result: http://localhost:3000/uploads/cover/image.webp
```

---

## 🛡️ Best Practices

### **1. Always Use Environment Variables**
```typescript
// ✅ Good
readonly coverImg = environment.coverImg;
<img [src]="coverImg + post.coverImage" />

// ❌ Bad - Hardcoded
<img [src]="'http://localhost:3000/uploads/cover/' + post.coverImage" />
```

### **2. Handle Missing Images**
```html
@if (post.coverImage) {
  <img [src]="coverImg + post.coverImage" [alt]="post.title" />
} @else {
  <div class="placeholder-image">
    <svg><!-- Placeholder icon --></svg>
  </div>
}
```

### **3. Fallback for Author Images**
```html
<img 
  [src]="post.author.image ? (profileImg + post.author.image) : demoImg" 
  [alt]="post.author.username"
/>
```

### **4. Error Handling**
```html
<img 
  [src]="coverImg + post.coverImage"
  (error)="onImageError($event)"
  [alt]="post.title"
/>
```

```typescript
onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'assets/placeholder.png';
}
```

---

## 🔍 Debugging

### **Check Image URL:**
```typescript
// In component
ngOnInit() {
  console.log('Cover Image URL:', this.coverImg + this.post.coverImage);
  // Should output: http://localhost:3000/uploads/cover/image.jpg
}
```

### **Network Tab:**
```
✅ Correct: http://localhost:3000/uploads/cover/image.jpg
❌ Wrong: /uploads/cover/image.jpg (missing domain)
❌ Wrong: http://localhost:3000/http://localhost:3000/uploads/... (double domain)
```

### **Fix Double Domain Issue:**

إذا كان الـ backend بيرجع full URL بدل relative path:

```typescript
// Helper function to extract relative path
private extractRelativePath(url: string): string {
  // Remove any base URL (localhost or production)
  return url.replace(/^https?:\/\/[^\/]+/, '');
}

// Usage in upload
this.http.post<{ url: string }>('/upload/cover', formData)
  .subscribe(response => {
    const relativePath = this.extractRelativePath(response.url);
    // Now: /uploads/cover/image.jpg (without domain)
  });
```

### **Common Issues:**

#### **Issue 1: Image not loading**
```
Problem: <img [src]="post.coverImage" />
Solution: <img [src]="coverImg + post.coverImage" />
```

#### **Issue 2: Double domain**
```
Problem: Backend returns full URL + Frontend adds domain
Solution: Backend should return relative path only
```

#### **Issue 3: Wrong environment**
```
Problem: Using dev URL in production
Solution: Check environment.production flag
```

---

## 📊 Image Paths Summary

| Type | Backend Returns | Frontend Adds | Final URL |
|------|----------------|---------------|-----------|
| Cover | `/uploads/cover/img.jpg` | `environment.coverImg` | `http://localhost:3000/uploads/cover/img.jpg` |
| Profile | `/uploads/profile/user.jpg` | `environment.profile` | `http://localhost:3000/uploads/profile/user.jpg` |
| Generic | `/uploads/any/file.jpg` | `environment.imgUrl` | `http://localhost:3000/uploads/any/file.jpg` |

---

## 🚀 Production Deployment

### **1. Update Environment:**
```typescript
// env.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api/v1',
  coverImg: 'https://cdn.yourdomain.com/uploads/cover/'
};
```

### **2. CDN Configuration (Optional):**
```typescript
// Use CDN for better performance
coverImg: 'https://cdn.yourdomain.com/uploads/cover/'
```

### **3. CORS Configuration:**
```typescript
// Backend: Allow CDN domain
app.enableCors({
  origin: ['https://yourdomain.com', 'https://cdn.yourdomain.com']
});
```

---

## ✅ Testing Checklist

- [ ] Post detail page shows cover image
- [ ] Private feeds show cover images
- [ ] Search results show cover images
- [ ] Post creation uploads image correctly
- [ ] Post edit loads existing image
- [ ] Missing images show placeholder
- [ ] Author profile images display
- [ ] Images work in production build
- [ ] CDN URLs work (if using CDN)
- [ ] CORS configured correctly

---

## 🎉 Summary

### **Backend:**
✅ Returns relative paths: `/uploads/cover/image.jpg`  
✅ No domain in response  
✅ Validation accepts strings (not just URLs)  

### **Frontend:**
✅ Uses `environment.coverImg` everywhere  
✅ Concatenates: `coverImg + post.coverImage`  
✅ Handles missing images gracefully  
✅ Works in dev and production  

**كل الصور دلوقتي بتعرض صح في كل مكان! 🖼️**
