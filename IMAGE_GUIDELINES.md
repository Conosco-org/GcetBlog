# Image Guidelines for GCET Blog

## Recommended Image Sizes

### Post Hero Images (Featured Images)
**Purpose**: Full-width hero image at the top of individual post pages

- **Recommended dimensions**: `1920 × 1080 px` (16:9 landscape)
- **Minimum dimensions**: `1400 × 900 px`
- **Aspect ratio**: 16:9 or 3:2 (landscape preferred)
- **Format**: JPEG or WebP
- **File size**: Under 300 KB (compress with tools like TinyPNG or ImageOptim)
- **Why**: Desktop hero displays at `min-h-[80vh]` (80% viewport height). Landscape images show fully without extreme cropping. Portrait images work but will be cropped to show face/top (`object-top`).

**Best practices**:
- Keep important content (faces, text) in the **top 60%** of the image
- Avoid critical details in the bottom 40% (will be cropped on desktop)
- Mobile displays at `60vh` so vertical space is already limited

### Card Thumbnails (Archive/List Pages)
**Purpose**: Grid cards on posts listing pages, homepage bento

- **Recommended dimensions**: `900 × 600 px` (3:2)
- **Minimum dimensions**: `600 × 400 px`
- **Aspect ratio**: 3:2 on mobile, 16:10 on tablet/desktop
- **Format**: JPEG or WebP
- **File size**: Under 150 KB
- **Why**: Cards use `aspect-[3/2] sm:aspect-[16/10]`. Images use `object-top` to preserve faces/important content at top.

### Meta/OG Images (Social Sharing)
**Purpose**: Social media preview cards (Facebook, Twitter, LinkedIn)

- **Recommended dimensions**: `1200 × 630 px` (1.91:1)
- **Format**: JPEG or PNG
- **File size**: Under 100 KB
- **Why**: This is the standard OG image size across all social platforms

## Upload Workflow

### Using Cloudinary (Recommended)
1. Upload image to Cloudinary (via their dashboard or API)
2. Copy the Cloudinary URL (e.g., `https://res.cloudinary.com/xxx/image/upload/v123/filename.jpg`)
3. In Payload CMS Media uploader:
   - Upload a placeholder/thumbnail (small file)
   - Paste Cloudinary URL into the **"Cloudinary URL"** field
4. The `useCloudinaryFallback` hook will automatically use the Cloudinary URL on the frontend

**Benefits**:
- Automatic CDN delivery
- Cloudinary auto-optimizes format (WebP on supported browsers)
- Faster load times globally

### Using Local Upload (Development)
1. Upload image via Payload CMS Media interface
2. Images stored in `public/media/`
3. Automatic resize to multiple sizes: thumbnail (300px), small (600px), medium (900px), large (1400px), xlarge (1920px)

## Image Optimization Tips

### Before Upload
- **Resize** images to recommended dimensions (don't upload 5000px originals)
- **Compress** using:
  - [TinyPNG](https://tinypng.com/) — drag & drop compression
  - [Squoosh](https://squoosh.app/) — advanced compression with presets
  - ImageOptim (Mac), FileOptimizer (Windows)
- **Format**:
  - JPEG for photos (80-85% quality is usually fine)
  - PNG for graphics with transparency
  - WebP for smaller sizes (not all tools support it during upload, but Cloudinary/Next.js can convert)

### For Portrait/Vertical Images
- **Hero images**: Crop to landscape or ensure face/subject is in **top 50%** of frame
- **Card thumbnails**: Use `3:2` crop with subject centered or top-aligned

### For Text/Overlays
- Ensure text overlays in hero images have sufficient contrast
- Test on both light and dark themes if your design supports theme toggle

## Current Image Behavior

### PostHero
- **Desktop**: `object-top` — shows top of image, crops bottom if needed
- **Mobile**: `object-top` — same behavior, but less total cropping due to smaller viewport

### Card Thumbnails
- **All viewports**: `object-top` — keeps faces/subjects visible

### HomePosts Featured
- **Desktop**: `object-cover` — fills entire container, centers image
- **Mobile**: Same behavior, but container is smaller

## Need to Resize Existing Images?

### Bulk Resize Script (Optional)
If you have many existing images that need resizing:

```bash
# Install ImageMagick (if not installed)
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Resize all JPEGs in a folder to 1920px width (maintains aspect ratio)
magick mogrify -resize 1920x1920\> -quality 85 *.jpg

# Or use this for cards (900px width)
magick mogrify -resize 900x900\> -quality 85 *.jpg
```

### Online Tools
- [Bulk Resize Photos](https://bulkresizephotos.com/) — batch resize
- [Cloudinary Media Editor](https://cloudinary.com/) — has built-in crop/resize tools

---

**TL;DR**:
- **Hero**: 1920×1080 landscape, <300 KB, top-aligned content
- **Cards**: 900×600 (3:2), <150 KB, face in top 60%
- **Use Cloudinary** for automatic optimization and global CDN delivery
