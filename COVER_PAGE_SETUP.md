# PDF Cover Page Setup Guide

## Issue

The PDF reports are showing a blue fallback cover page instead of the custom cover images.

## Root Cause

The cover page image files in the `/public` folder are **empty (0 bytes)**:

- `KMRL Daily Cover Page.jpg` - 0 bytes ❌
- `KMRL Monthly Cover Page.jpg` - 0 bytes ❌
- `KMRL Annual Cover Page.jpg` - 0 bytes ❌

## Solution

### Step 1: Replace Empty Image Files

Replace the empty `.jpg` files in the `/public` folder with actual cover page images:

1. **Daily Cover Page**

   - File: `public/KMRL Daily Cover Page.jpg`
   - Recommended size: 1654 x 2339 pixels (A4 ratio at 200 DPI)
   - Format: JPEG
   - Max file size: < 2 MB

2. **Monthly Cover Page**

   - File: `public/KMRL Monthly Cover Page.jpg`
   - Recommended size: 1654 x 2339 pixels (A4 ratio at 200 DPI)
   - Format: JPEG
   - Max file size: < 2 MB

3. **Yearly/Annual Cover Page**
   - File: `public/KMRL Annual Cover Page.jpg`
   - Recommended size: 1654 x 2339 pixels (A4 ratio at 200 DPI)
   - Format: JPEG
   - Max file size: < 2 MB

### Step 2: Verify File Paths

Ensure the filenames match exactly:

```
public/
  ├── KMRL Annual Cover Page.jpg
  ├── KMRL Daily Cover Page.jpg
  └── KMRL Monthly Cover Page.jpg
```

### Step 3: Test the Report

1. Open the application: `http://localhost:8084`
2. Navigate to Reports section
3. Select report type (Daily/Monthly/Yearly)
4. Click "Download PDF"
5. Open the PDF and verify the cover page appears

## Current Behavior

### With Empty Images (Current)

- Shows a professional blue gradient fallback cover page
- Displays report type, organization name, and date
- Console shows: "Image loading timeout - image may be missing or empty"

### With Valid Images (Expected)

- Shows the custom KMRL cover page design
- Full-page image matching the report type
- No console warnings

## Technical Details

The PDF generator (`src/lib/simplePdfGenerator.ts`) attempts to:

1. Load the cover image based on report type
2. Convert it to base64
3. Embed it as the first page of the PDF
4. If loading fails (timeout/error), use the fallback cover page

**Timeout**: 5 seconds

## Troubleshooting

### Issue: Still seeing fallback cover page after adding images

**Solutions:**

- Clear browser cache (Ctrl + Shift + R)
- Verify image file size is > 0 bytes
- Check browser console for error messages
- Ensure images are valid JPEG format

### Issue: Images not loading

**Solutions:**

- Check filename spelling matches exactly (including spaces)
- Verify images are in `/public` folder, not `/public/images`
- Try different image compression settings
- Ensure images are web-optimized JPEGs

### Issue: PDF generation is slow

**Solutions:**

- Reduce cover page image file size (< 1 MB recommended)
- Use optimized JPEG compression (quality: 80-90%)
- Reduce image dimensions if too large

## Image Design Recommendations

### Daily Report Cover

- Emphasis on "today's date"
- Dynamic, real-time data theme
- Colors: Blues and greens

### Monthly Report Cover

- Calendar/month theme
- Summary-focused design
- Colors: Professional blues

### Annual Report Cover

- Formal, executive style
- Year prominently displayed
- Colors: Deep blues, golds

## File Checklist

- [ ] Images are not 0 bytes
- [ ] Filenames match exactly (with spaces)
- [ ] Images are valid JPEG format
- [ ] Images are in `/public` folder
- [ ] Application restarted after adding images
- [ ] Browser cache cleared
- [ ] PDF tested and cover page appears

---

**Last Updated:** October 4, 2025
**Status:** ⚠️ Awaiting valid image files
