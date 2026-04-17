# 🍰 Enjoy Plus (Sweets Store)

[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-cyan.svg)](https://tailwindcss.com)
[![AI Powered](https://img.shields.io/badge/AI-Flowise-purple.svg)](https://flowiseai.com)

**Enjoy Plus** is a premium E-commerce destination for baking enthusiasts and sweets lovers. It offers a specialized selection of professional tools, high-quality ingredients, and curated baking kits, all integrated with an advanced AI shopping assistant.

---

## 🎂 Discover the Sweetest Experience

<p align="center">
  <img src="./screenshots/Home%20page.png" width="100%" alt="Home Page">
</p>

### 🌟 Exclusive Features

- **🤖 Shehab AI Assistant**: A custom AI-powered chatbot (integrated via Flowise) to help users find the perfect products and recipes.
- **🧁 Baking Packages**: Specially curated kits for starters and professionals (Cake Decorator Kit, Chocolate Lover's Bundle).
- **🛒 Seamless Commerce**:
  - Advanced cart system with real-time updates.
  - Wishlist functionality for future inspirations.
  - Streamlined Checkout process with multiple payment options.
- **🌍 Full Bilingual Experience**: Tailored shopping in both Arabic and English.
- **🌗 Aesthetic Themes**: Elegantly designed Light and Dark modes.
- **🎭 Modern UI/UX**: Built with React and Radix UI for smooth, interactive components and premium feel.
- **🎨 Brand Integration**: Filter and find products by your favorite professional baking brands.

---

## 📸 Interface Showcase

| Dark Mode Experience | Bundle Packages |
|:---:|:---:|
| <img src="./screenshots/English%20and%20dark%20mode.png" width="400"> | <img src="./screenshots/Pakcage%20page.png" width="400"> |

| Cart & Shopping | AI Assistance |
|:---:|:---:|
| <img src="./screenshots/Cart%20.png" width="400"> | <img src="./screenshots/Shehab%20AI%20assistance.png" width="400"> |

| Wishlist | Secure Login |
|:---:|:---:|
| <img src="./screenshots/Wish%20List%20page.png" width="400"> | <img src="./screenshots/Login%20page.png" width="400"> |

---

## 🛠️ Technology Stack

- **Backend**: Laravel 11 (API-driven)
- **Frontend**: React 18, Vite
- **AI Engine**: Flowise AI Integration (Custom Chatbot)
- **Styling**: TailwindCSS & Material UI
- **Database**: MySQL / MariaDB (Optimized for performance)
- **Animations**: Framer Motion for premium transitions

---

## 🚀 Installation & Setup

### Requirements

- PHP 8.2+
- Node.js 18+
- Composer
- MySQL/MariaDB

### Setup Instructions

1. **Clone & Enter**:
   ```bash
   git clone https://github.com/bourbon07/Web-projects-.git
   cd "Sweets store"
   ```

2. **Backend Setup**:
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   ```

3. **Frontend Setup**:
   ```bash
   npm install
   npm run build
   ```

4. **Environment Configuration**:
   Ensure your `.env` contains the required AI and Google credentials:
   - `FLOWISE_CHAT_URL`
   - `GOOGLE_CLIENT_ID` (for Social Login)

5. **Start Servers**:
   ```bash
   php artisan serve
   # In another terminal
   npm run dev
   ```

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center"> Crafting sweetness with <b>Enjoy Plus</b> <br> Developed by <b>Fawaz Allan</b> </p>
