# AI Assistant Rules for MotoFinance App

This document outlines the technical stack and guidelines for developing the MotoFinance application.

## Tech Stack

The MotoFinance application is built using the following technologies:

*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **React Router**: For declarative routing within the application, with routes kept in `src/App.tsx`.
*   **Recharts**: A composable charting library built on React components for data visualization.
*   **Lucide React**: A collection of customizable SVG icons for React applications.
*   **Vite**: A fast build tool that provides an extremely quick development experience.
*   **Custom Context API**: For efficient global state management across components.

## Library Usage Rules

To maintain consistency and leverage the strengths of our chosen libraries, please adhere to the following rules:

*   **UI Components**:
    *   **Prioritize shadcn/ui**: Always try to use components from the `shadcn/ui` library first. These components are pre-styled with Tailwind CSS and provide a consistent look and feel.
    *   **Custom Components**: If a required component is not available in `shadcn/ui` or needs significant custom logic/styling not easily achievable with `shadcn/ui` overrides, create a new custom component in `src/components/`.
*   **Styling**:
    *   **Tailwind CSS**: All styling must be done using Tailwind CSS utility classes. Avoid inline styles or separate CSS files unless absolutely necessary for global styles (e.g., `index.css`).
*   **Icons**:
    *   **Lucide React**: Use icons from the `lucide-react` library.
*   **Charting**:
    *   **Recharts**: For any data visualization or charting requirements, use the `recharts` library.
*   **Routing**:
    *   **React Router**: Manage all application routes using React Router. Define routes primarily in `src/App.tsx`.
*   **State Management**:
    *   **React Context API**: For application-wide state management, utilize the `FinanceContext` or create new contexts as needed.
*   **Modals**:
    *   Currently, a custom `Modal` component exists in `src/components/Modal.tsx`. Continue to use this component for modal dialogs. If `shadcn/ui` offers a more robust or feature-rich modal component in the future, consider migrating.