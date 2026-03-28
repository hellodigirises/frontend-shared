# Realesso Frontend (Shared Repository)

This is the shareable frontend repository for Realesso, synchronized with the latest production code and configured for live backend connectivity.

## 🚀 Getting Started

1.  **Configure API**:
    The API URL is managed via environment variables.
    - Create a `.env` file.
    - Set `VITE_API_URL` to your live backend.
    - Default: `https://realesso.onrender.com/api/v1`

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

## 🛠 Features
- **Live Backend Connection**: Dynamically switches between `localhost` and Render via `.env`.
- **Role-Based Routing**: Supports Tenant Admin, HR, Manager, and Agent roles.
- **Production-Ready**: Includes all recent fixes for announcements and notifications.
