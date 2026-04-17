# Cloudinary Setup Instructions

## Issue
The Cloudinary PHP package cannot be installed automatically due to security advisories in other dependencies.

## Solution

You need to manually install the Cloudinary package. Here are the steps:

### Option 1: Install with audit disabled (Recommended)
```bash
composer require cloudinary/cloudinary_php --no-audit
```

### Option 2: Disable audit temporarily
Add this to your `composer.json`:
```json
"config": {
    "audit": {
        "block-insecure": false
    }
}
```
Then run:
```bash
composer require cloudinary/cloudinary_php
```

### Option 3: Manual installation
1. Edit `composer.json` and add:
```json
"require": {
    "cloudinary/cloudinary_php": "^2.9"
}
```

2. Run:
```bash
composer update --no-audit
```

## Environment Variables Required

Make sure your `.env` file has these variables:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## After Installation

1. Run `composer dump-autoload`
2. Clear config cache: `php artisan config:clear`
3. Test the image upload functionality

