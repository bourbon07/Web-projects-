# 🛒 Makateb Store (مكاتب ستور)

[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-blue.svg)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional, feature-rich E-commerce platform specialized in stationery and office supplies. Built with a modern tech stack focusing on performance, scalability, and user experience.

---

## 🎨 Professional Interface

<p align="center">
  <img src="./screenshots/Home%20page.png" width="100%" alt="Home Page">
</p>

### ✨ Key Features

- **🛍️ Comprehensive Product Catalog**: Organized by categories (Writing Instruments, Notebooks, Office Tech, etc.).
- **📦 Smart Bundles (Packages)**: Curated sets of products available at discounted rates.
- **🌍 Bilingual Support**: Full support for both Arabic and English languages.
- **🌙 Dynamic Themes**: Smooth transition between Light and Dark modes.
- **🔒 Secure Authentication**: Robust user registration and login system.
- **🛒 Advanced Shopping Experience**:
  - Real-time Cart management.
  - Wishlist for saving favorite items.
  - Multi-step checkout process.
- **💬 Community Interaction**: Product ratings and comments from verified buyers.
- **⚡ Performance Optimized**: Fast asset loading using Vite and optimized database queries.

---

## 📸 Screenshots Gallery

| Home Page (Dark Mode) | Product Details |
|:---:|:---:|
| <img src="./screenshots/Dark%20and%20english%20language.png" width="400"> | <img src="./screenshots/Product%20page.png" width="400"> |

| Authentication | Administrative Control |
|:---:|:---:|
| <img src="./screenshots/Login%20page.png" width="400"> | *Clean & Modern Dashboard* |

---

## 🛠️ Tech Stack

- **Backend**: Laravel 11.x
- **Frontend**: Vue.js 3 with Vite
- **Styling**: TailwindCSS
- **Database**: MySQL / SQLite
- **Asset Management**: Cloudinary (for production-ready image handling)
- **UI Components**: custom-built for a premium feel

---

## 🚀 Getting Started

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js & NPM
- SQLite (or MySQL)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bourbon07/Web-projects-.git
   cd Makateb-Store
   ```

2. **Install Dependencies**:
   ```bash
   composer install
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database Configuration**:
   Create a database and update `.env` credentials. For SQLite:
   ```bash
   touch database/database.sqlite
   ```

5. **Run Migrations & Seeders**:
   ```bash
   php artisan migrate --seed
   ```

6. **Compile Assets & Start Server**:
   ```bash
   npm run build # For production
   # OR
   npm run dev # For development
   
   php artisan serve
   ```

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

<p align="center"> Developed by <b>Hamza</b> </p>
