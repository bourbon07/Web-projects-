# 🍰 Enjoy Plus (Sweets store)

[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-cyan.svg)](https://tailwindcss.com)
[![AI Powered](https://img.shields.io/badge/AI-Flowise-purple.svg)](https://flowiseai.com)

**Enjoy Plus** is a professional-grade E-commerce ecosystem designed for the modern confectionery and baking industry. This repository includes a high-performance Web Application (API + Frontend) and a companion Mobile Application, all integrated with a custom AI shopping assistant.

---

## 🎂 The Sweetest Shop Experience

<p align="center">
  <img src="./screenshots/Home%20page.png" width="100%" alt="Home Page">
</p>

### 🌟 Premium Features

- **🤖 Shehab AI Assistant**: A custom-trained AI companion (via Flowise AI) that helps customers with product recommendations, recipes, and shopping queries through a secure Laravel proxy.
- **🧁 Specialized Baking Packages**: Curated product bundles (Starter Kits, Pro Baker Sets) designed to increase Average Order Value (AOV).
- **🛡️ Robust Admin Ecosystem**:
  - Full inventory management for products, categories, and brands.
  - Comprehensive order tracking and fulfillment dashboard.
  - Dynamic settings management (Cities, Payment Methods, Global UI settings).
- **🛒 High-Conversion Shop**:
  - Real-time cart management with optimistic UI updates.
  - Personalized wishlist and order history.
  - Social authentication via Google.
- **📱 Multi-Platform Reach**: Unified experience across Desktop (React) and Mobile-optimized interfaces.
- **🌍 Full Globalization**: Seamless Arabic and English support with dynamic LTR/RTL layout switching.

---

## 📸 Interface Showcase

| Premium Dark Mode | Smart Bundles |
|:---:|:---:|
| <img src="./screenshots/English%20and%20dark%20mode.png" width="400"> | <img src="./screenshots/Pakcage%20page.png" width="400"> |

| Shehab AI Bot | Shopping Cart |
|:---:|:---:|
| <img src="./screenshots/Shehab%20AI%20assistance.png" width="400"> | <img src="./screenshots/Cart%20.png" width="400"> |

| Admin Dashboard | Wishlist |
|:---:|:---:|
| <img src="./screenshots/admin%20dashboard.png" width="400"> | <img src="./screenshots/Wish%20List%20page.png" width="400"> |

---

## 🛠️ Advanced Tech Stack

### 💻 Web Application (Back-End)
- **Framework**: Laravel 11 (PHP 8.2+)
- **API**: High-performance RESTful API with Sanctum authentication.
- **AI Integration**: Custom proxy controller for Flowise AI endpoints.
- **Database**: MySQL/MariaDB with optimized Eloquent relationships.

### 🎨 Web Application (Front-End)
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite 6 (ultra-fast HMR).
- **Styling**: TailwindCSS 4 & Radical UI (Radix) for accessible components.
- **State Management**: Context API for lightweight, efficient global state.
- **Animations**: Framer Motion for high-end boutique feel.

### 📱 Mobile Application
- **Stack**: Responsive React/Vite implementation optimized for mobile-first interactions.
- **UI Architecture**: Material UI (MUI) and custom design tokens.

---

## 🚀 Deployment & Setup

### Prerequisites
- PHP 8.2+ & Node.js 18+
- Composer & NPM/PNPM
- MySQL/MariaDB

### Installation
1. **Repository Setup**:
   ```bash
   git clone https://github.com/bourbon07/Web-projects-.git
   cd "Sweets store"
   ```

2. **Backend Development**:
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve --port=8081
   ```

3. **Frontend Development**:
   ```bash
   npm install
   npm run build
   # For hot reloading:
   npm run dev
   ```

---

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

<p align="center"> Crafting sweetness with <b>Enjoy Plus</b> <br> Developed by <b>Fawaz Allan</b> </p>
