# E-Reseta

**Electronic Prescription System** for healthcare professionals to easily generate prescriptions electronically.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Auth & Database**: Firebase (Authentication + Firestore)
- **Styling**: Tailwind CSS
- **Routing**: React Router

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory with your Firebase credentials:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Run development server**:

   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Key Features

- Google Sign-In authentication for healthcare professionals
- Profile management with medical license verification
- Electronic prescription generation
- Prescription history and management
- Customizable prescription templates

## Project Structure

```
src/
├── auth/              # Authentication context and protected routes
├── components/        # Reusable UI components
├── firebase/          # Firebase configuration
├── pages/             # Page components
└── assets/            # Static assets
```

## Color Palette

- **Primary**: `#1D3557` (Structured Navy)
- **Secondary**: `#457B9D` (Soft Steel Blue)
- **Accent**: `#A8DADC` (Calm Sky Cyan)
- **Background**: `#F1FAEE` (Clinical White)
- **Text**: `#0B0B0B` (Medical Black)

## Documentation

Additional documentation can be found in the `docs/` folder.

## License

Private project for healthcare use.
