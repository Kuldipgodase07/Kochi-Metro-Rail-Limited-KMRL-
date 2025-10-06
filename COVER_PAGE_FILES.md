# Cover Page Files Configuration

## Current Files in /public

✅ **Daily Report:** `KMRL_DailyReport_Cover_Page[1].png` (359,237 bytes)
✅ **Monthly Report:** `Monthly_Report[1].png` (636,175 bytes)  
✅ **Annual Report:** `kmrl-annual-report-cover.jpg[1].jpg` (187,781 bytes)

## Code Configuration

The PDF generator (`src/lib/simplePdfGenerator.ts`) is configured to use these exact filenames:

```typescript
const coverPageMap = {
  daily: "/KMRL_DailyReport_Cover_Page[1].png",
  monthly: "/Monthly_Report[1].png",
  yearly: "/kmrl-annual-report-cover.jpg[1].jpg",
};
```

## How It Works

1. **User selects report type** (Daily/Monthly/Yearly)
2. **Clicks "Download PDF"**
3. **System loads the corresponding cover image:**
   - Daily → KMRL_DailyReport_Cover_Page[1].png
   - Monthly → Monthly_Report[1].png
   - Yearly → kmrl-annual-report-cover.jpg[1].jpg
4. **Converts image to base64** using canvas
5. **Embeds as first page** of PDF (A4 size: 210mm x 297mm)
6. **Adds report content** on subsequent pages

## Image Format Support

- ✅ **PNG files** - Detected automatically
- ✅ **JPEG files** - Detected automatically
- 🔄 **Auto-detection** based on file extension

## Testing Steps

1. Open application: `http://localhost:8084`
2. Navigate to Reports section
3. Select **Daily Report** → Click "Download PDF"
   - Should show: `KMRL_DailyReport_Cover_Page[1].png` as cover
4. Select **Monthly Report** → Click "Download PDF"
   - Should show: `Monthly_Report[1].png` as cover
5. Select **Yearly Report** → Click "Download PDF"
   - Should show: `kmrl-annual-report-cover.jpg[1].jpg` as cover

## Console Messages

### Success:

```
✅ Cover page added successfully: daily report (PNG)
✅ Cover page added successfully: monthly report (PNG)
✅ Cover page added successfully: yearly report (JPEG)
```

### Error/Fallback:

```
❌ Error loading cover page image: [error details]
📁 Attempted to load: /path/to/image
💡 Using fallback cover page instead
```

## Troubleshooting

### Issue: Cover page not showing

**Check:**

1. File exists in `/public` folder
2. Filename matches exactly (case-sensitive)
3. File size > 0 bytes
4. Image is valid PNG/JPEG format
5. Browser console for errors

### Issue: Brackets in filename causing problems

**Solution:**
Rename files to remove `[1]`:

- `KMRL_DailyReport_Cover_Page[1].png` → `KMRL_DailyReport_Cover_Page.png`
- `Monthly_Report[1].png` → `Monthly_Report.png`
- `kmrl-annual-report-cover.jpg[1].jpg` → `kmrl-annual-report-cover.jpg`

Then update the code in `simplePdfGenerator.ts` accordingly.

### Issue: PDF generation slow

**Cause:** Large image files
**Solution:**

- Optimize images (recommended: < 1 MB each)
- Use JPEG with 80-90% quality
- Resize to A4 dimensions (1654 x 2339 pixels at 200 DPI)

## Recommended File Organization

**Option 1: Keep current names** (Working now)

```
public/
  ├── KMRL_DailyReport_Cover_Page[1].png
  ├── Monthly_Report[1].png
  └── kmrl-annual-report-cover.jpg[1].jpg
```

**Option 2: Clean names** (Recommended for future)

```
public/
  ├── KMRL_Daily_Cover_Page.png
  ├── KMRL_Monthly_Cover_Page.png
  └── KMRL_Annual_Cover_Page.jpg
```

## Image Specifications

### Current Files:

- **Daily:** 359 KB (PNG)
- **Monthly:** 636 KB (PNG) ⚠️ Consider optimizing
- **Annual:** 188 KB (JPEG) ✅ Good size

### Recommended:

- Format: JPEG for photos, PNG for graphics with text
- Dimensions: 1654 x 2339 pixels (A4 @ 200 DPI)
- File Size: < 500 KB per file
- Quality: 85-90% JPEG compression

## Status

✅ **Implementation Complete**
✅ **Cover pages configured**
✅ **Auto-format detection working**
✅ **Fallback cover page available**

---

**Last Updated:** October 4, 2025
**Status:** ✅ Ready to use
