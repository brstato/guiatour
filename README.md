# Pages - Project Documentation

[🇧🇷 Versão em Português](./README.pt-BR.md)

## 🚀 Overview

**Pages** is a management ecosystem for professionals (such as tattoo artists and studios), enabling portfolio management, scheduling, anamnesis, and account settings. It was built with a focus on performance, scalability, and a fluid user experience.

This document details the project's internal workings, its architecture, and development patterns.

---

## 🏗️ Architecture and Data Flow

The project utilizes a **Feature-Based** architecture, where each system module is independent and encapsulates its own logic, services, and components.

### The Lifecycle of a Call (Data Flow)

The data interaction lifecycle follows these steps:

1.  **Component (View):** The user interacts with a React component (e.g., clicks "Save").
2.  **Controller (Custom Hook):** The component calls a function exposed by a Controller (e.g., `handleUpdate` from `usePortfolioController`). The Controller manages local state and may perform an **Optimistic Update**, updating the UI even before the server's response for a faster feel.
3.  **Service (Data Layer):** The Controller invokes a method from a Service (e.g., `portfolioService.updatePortfolio`).
4.  **API Client (Axios):** The Service uses the global `api.ts` instance to perform the HTTP request.
    *   **Interceptors:** Before the request is sent, an interceptor injects the authentication token. If the response returns an expired token error (401), the response interceptor automatically attempts to renew the token (Refresh Token) and retries the original request seamlessly.
5.  **Return:** The data travels back through the Service, is processed by the Controller (which updates the application's final state), and reflects in the View.

---

## 🧩 Component Functionality

We adopt the **Controller-View** pattern through Custom Hooks:

*   **Views (`pages/` and `components/` folders):** These are "thin" React components. They don't know *how* data is fetched or saved; they only know *how* to display it and which functions to call in response to events.
*   **Controllers (`hooks/` folders):** These are the "brain" of the functionality. They use `useState`, `useEffect`, and call the `Services`. They expose only what is necessary to the View: data (`data`), loading states (`isLoading`), and event handlers (`handle...`).

---

## 🏛️ Object-Oriented Programming (OOP)

While React is focused on functional programming, we use **Object-Oriented** principles in the Service layer to ensure organization and reuse:

*   **Service Classes:** Each feature (Auth, Portfolio, Account) has a dedicated class (e.g., `PortfolioService`).
*   **Singleton Pattern:** We export a single instance of the service class (`export const portfolioService = new PortfolioService()`). This ensures that the API configuration state is consistent and centralized.
*   **Encapsulation:** Data "cleaning" logic, payload formatting, and specific endpoints are hidden within the class methods, exposing a clean interface to the Controllers.

Example:
```typescript
class PortfolioService {
  private cleanUrl(url: string) { ... } // Private logic
  async updatePortfolio(data) { ... }    // Public interface
}
```

---

## 📂 Folder Structure

```text
src/
├── services/           # Global API instance and Interceptors (The heart of communication)
├── lib/                # Shared utilities (e.g., image compression)
├── layouts/            # Page structures (AppLayout, AuthLayout)
├── features/           # Business modules
│   └── [feature]/
│       ├── services/   # OOP classes for API calls
│       ├── hooks/      # Controllers (State and event logic)
│       ├── pages/      # Main Views
│       └── components/ # Feature-specific components
```

---

## 🛠️ Main Technologies

- **React 19 & TypeScript:** Project foundation.
- **Tailwind CSS v4:** Modern and fast styling.
- **Axios:** Request management with complex interceptors for Refresh Token.
- **Shadcn UI:** Interface component library.
- **Google OAuth:** Simplified authentication.

---

## 🚦 Getting Started

1. `npm install` to install dependencies.
2. Configure `.env` based on `.env.example`.
3. `npm run dev` to start the development environment.
# pages
