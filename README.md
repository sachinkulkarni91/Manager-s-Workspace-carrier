# 🚨 Incident Portal

A modern, responsive Incident Management Portal designed to streamline issue tracking and resolution workflows. This portal serves as a sub-portal to systems like ServiceNow, providing a focused UI for incident handling.

## 📦 Tech Stack

- **Framework:** Vite + React 18
- **UI Components:** [Radix UI Primitives](https://www.radix-ui.com/)
- **Styling:** Tailwind CSS (via `tailwind-merge`, `clsx`)
- **Form Handling:** `react-hook-form`
- **Data Visualization:** `recharts`
- **Carousel & Interactions:** `embla-carousel-react`, `react-resizable-panels`
- **Theme Support:** `next-themes`
- **Icons:** `lucide-react`
- **Notifications:** `sonner`
- **OTP Input:** `input-otp`
- **Other UI Enhancements:** `cmdk`, `vaul`

## 📁 Project Structure
```
incident-portal/
├── public/
├── src/
│ ├── components/
│ ├── pages/
│ ├── hooks/
│ ├── styles/
│ └── utils/
├── package.json
├── vite.config.ts
└── README.md
```


## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Swaraj-Patil/incident-portal.git
cd incident-portal

# Install dependencies
npm install
# or
yarn
```

### Running in Development
```bash
npm run dev
# or
yarn dev
```

Open your browser at `http://localhost:3000`

### Building for Production
```bash
npm run build
# or
yarn build
```

### 🧩 Features
- 📄 Incident listing, filtering, and status tracking
- 💬 Detailed incident views with dialog modals
- ✅ Status updates with role-based permissions
- 📊 Analytics dashboard with Recharts
- 🔍 Keyboard-powered command palette (via cmdk)
- 🌗 Light & Dark mode support
- 🔐 OTP-based verification for sensitive actions

### 🧪 Development Tools
- Vite - Fast dev server and optimized builds
- TypeScript - Type-safe development
- Radix UI - Accessible headless UI primitives
- Sonner - Toast notifications with smooth UX

### 🧱 Components Used (Radix UI)
This project makes extensive use of [Radix UI](https://www.radix-ui.com/) including:
- Dialogs, Tooltips, Accordions
- Tabs, Menus, Dropdowns
- Sliders, Progress Bars, Switches
- Scroll Areas, Selects, and more

### 🔐 Security & Access Control
While this is a front-end portal, you should integrate it with secure backend APIs for:
- Authentication (e.g., OAuth, SSO)
- Role-based access
- Incident logs and audit trails

### 📌 Future Enhancements
- 🔄 Real-time updates via WebSockets
- 🧾 Integration with external systems (e.g., ServiceNow, Jira)
- 📱 Mobile responsiveness and PWA support
- 📤 Export/Import incidents as CSV or JSON