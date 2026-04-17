# Cloudinary Environment Variables Setup

## Add this to your `.env` file:

```env
CLOUDINARY_URL=cloudinary://117159534121969:KXu0ssey4VFAq2pMmAYTpFCINrQ@dqre1gfnl
```

**Format:** `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME`

**Note:** You can also use individual variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) as a fallback, but CLOUDINARY_URL is the preferred method.

## After adding to .env:

1. Clear config cache:
   ```bash
   php artisan config:clear
   ```

2. Restart your Laravel server if it's running

3. Test the Cloudinary integration by:
   - Going to Profile page and clicking "Upload Image" → "From Cloudinary"
   - Going to Items page and creating a product → "From Cloudinary"

## Troubleshooting:

If images don't appear:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for errors
3. Verify credentials are correct in `.env`
4. Make sure you have images uploaded to your Cloudinary account

