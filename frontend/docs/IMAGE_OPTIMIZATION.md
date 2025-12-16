# Image and Asset Optimization

This document describes the optimized image and asset components created for TarotFlavia.

## Components

### 1. OptimizedImage

Wrapper around Next.js Image with sensible defaults.

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

// Above-the-fold image (loads immediately)
<OptimizedImage
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
/>

// Lazy loaded image (default)
<OptimizedImage
  src="/card.jpg"
  alt="Card"
  width={300}
  height={400}
/>

// With blur placeholder
<OptimizedImage
  src="/avatar.jpg"
  alt="Avatar"
  width={100}
  height={100}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 2. Logo

TarotFlavia brand logo component.

```tsx
import { Logo } from '@/components/ui/logo';

// In header (above-the-fold, loads immediately)
<Logo priority />

// In footer (lazy loaded)
<Logo />

// Custom size
<Logo width={200} height={80} />
```

### 3. UserAvatar

Optimized avatar component with fallback to initials.

```tsx
import { UserAvatar } from '@/components/ui/user-avatar';

// With image
<UserAvatar
  src="/user.jpg"
  alt="John Doe"
  size="md"
/>

// With initials fallback (no image)
<UserAvatar
  alt="John Doe"
  initials="JD"
  size="sm"
/>

// Sizes: 'sm' (32px/32px), 'md' (48px/48px), 'lg' (64px/64px), 'xl' (96px/96px)
```

## Static Assets

### SVG Assets

Located in `/public/`:

- **logo.svg** - TarotFlavia brand logo (180x60px)
- **card-placeholder.svg** - Placeholder for tarot cards (160x240px)
- **avatar-placeholder.svg** - Default avatar placeholder (100x100px)
- **icon-192.svg** - PWA icon 192x192
- **icon-512.svg** - PWA icon 512x512

**Note:** Apple touch icon requires PNG format for iOS compatibility. Current `apple-touch-icon.png` is a placeholder and should be replaced with an actual PNG (180x180) before production deployment.

### PWA Configuration

**manifest.json** - Progressive Web App manifest with:

- App name and description
- Theme colors (primary: #805AD5, background: #F9F7F2)
- Icons for different sizes
- Display mode: standalone
- Orientation: portrait-primary

### Favicon

- **favicon.ico** - Standard favicon in app directory

## Next.js Configuration

Image optimization settings in `next.config.ts`:

```typescript
images: {
  // Supported formats (AVIF > WebP > JPEG)
  formats: ['image/avif', 'image/webp'],

  // Remote image patterns
  remotePatterns: [
    { hostname: 'upload.wikimedia.org' },
    { hostname: '*.wikimedia.org' },
  ],

  // Cache optimized images for 30 days
  minimumCacheTTL: 60 * 60 * 24 * 30,

  // Device and image sizes for responsive images
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

## Best Practices

1. **Use priority for above-the-fold images**

   ```tsx
   <Logo priority /> // Header logo
   <OptimizedImage src="/hero.jpg" priority /> // Hero image
   ```

2. **Lazy load everything else**

   ```tsx
   <OptimizedImage src="/card.jpg" /> // Default is lazy
   ```

3. **Always provide width and height**

   ```tsx
   // Prevents layout shift
   <OptimizedImage width={300} height={400} />
   ```

4. **Use placeholders for better UX**

   ```tsx
   <UserAvatar initials="JD" /> // Shows initials while loading
   ```

5. **Prefer SVG for icons and logos**
   - Better quality at all sizes
   - Smaller file size
   - No pixelation

## Performance Impact

- **AVIF format**: ~50% smaller than JPEG
- **WebP format**: ~30% smaller than JPEG
- **Lazy loading**: Only loads images when needed
- **Responsive images**: Serves optimal size per device
- **Cache**: 30-day cache reduces server load

## Testing

Run tests for new components:

```bash
npm test -- optimized-image.test.tsx
npm test -- logo.test.tsx
npm test -- user-avatar.test.tsx
```

All tests should pass with 100% coverage.
