# Taskflow frontend

## Run locally

1. Start the FastAPI backend at `http://127.0.0.1:8000`.
2. From this folder, install dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

3. Open the localhost URL printed by Vite (by default `http://localhost:5173`).

The API base URL defaults to `http://127.0.0.1:8000`. To use another local API
address, copy `.env.example` to `.env` and set `VITE_API_URL`.
