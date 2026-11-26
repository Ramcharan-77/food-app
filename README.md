# FoodApp — Full-Stack Frontend Ecosystem & Automated CI/CD

A responsive, multi-module food ordering and operations platform built with vanilla **HTML5, CSS3, and JavaScript**, featuring an automated **GitHub Actions CI/CD pipeline** deployed to **GitHub Pages**.

**Live Demo:** [https://github.io](https://ramcharan-77.github.io/food-app/)

---

## Core Modules & Features

### 1. Customer Storefront (`index.html`, `menu-page/`, `cart-page/`)

- **Responsive Design System (`shared/style.css`):** Mobile-first CSS variables, Flexbox/Grid layouts, and touch-friendly controls across phones, tablets, and desktops.
- **Infinite Scroll Menu:** Smooth `IntersectionObserver` batch loading with instant search, category filter pills, and Veg/Non-Veg indicators.
- **Smart Cart & Checkout:** Live navbar cart badge, quantity steppers (`- 1 +`), free-delivery progress tracker, saved address selector, and FoodApp Wallet payments.

### 2. Authentication & Customer Account (`login-page/`, `profile-page/`)

- **Two-Factor Authentication (2FA):** Two-step credential sign-in followed by a 6-digit OTP verification flow.
- **Account Management:** Edit personal details, manage multiple delivery addresses, top up FoodApp Wallet balance, and reorder past meals in one click.

### 3. Operations & Dispatch Command Center (`admin-panel/`)

- **Order & Dispatch Monitoring:** Assign delivery riders and update live order statuses (`Preparing` → `Out for Delivery` → `Delivered`).
- **Vendor & Fleet Management:** Toggle restaurant kitchen availability and manage rider duty statuses.
- **Customer Support Desk:** Review support tickets and credit instant refunds directly to customer wallets.

---

## Project Structure

```text
food-app/
├── .github/workflows/deploy.yml   # Automated CI checks & GitHub Pages CD
├── .vscode/                       # Shared team Prettier & VS Code settings
├── .prettierrc                    # Consistent formatting rules
├── index.html                     # Landing page & featured dishes
├── shared/
│   ├── style.css                  # Global design tokens & responsive UI
│   └── utils.js                   # Centralized state, auth & auto-navbar
├── menu-page/                     # Infinite scroll catalog & filters
├── cart-page/                     # Cart, bill summary & wallet checkout
├── login-page/                    # 2-step login with 6-digit 2FA OTP
├── profile-page/                  # Profile, addresses, orders & wallet
└── admin-panel/                   # Dispatch, vendors, fleet & support
```

---

## Automated CI/CD & Team Workflow

- **Continuous Integration (CI):** Every Pull Request to `main` automatically verifies required files, validates JavaScript syntax (`node --check`), and lints all HTML files (`htmlhint`).
- **Continuous Deployment (CD):** Merging into `main` packages a clean `_site` build and deploys automatically to GitHub Pages.
- **Branch Protection:** Direct pushes to `main` are blocked; all changes go through feature branches and Pull Requests.
