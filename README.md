# Lucia Auth with Google Next.js DrizzleORM SQLite

<!-- ## Project Description -->

**This project demonstrates a comprehensive authentication system integrated with Next.js, DrizzleORM, and SQLite using Lucia Auth. The system supports authentication via email and password, as well as third-party authentication using Google.**

## Setup and Installation,

### Clone the Repository:

```bash
git clone https://github.com/rohanyh101/LuciaAuth-Google-Next.js-DrizzleORM-SQLite
cd your-repo-name
```

### Install Dependencies:

```bash
npm install
```

### Create a .env file in the root directory and add the following variables (for reference can see .env.example):

```
NODE_ENV=development
NEXT_PUBLIC_URL=http://localhost:3000

TURSO_CONNECTION_URL=
TURSO_AUTH_TOKEN=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

RESEND_CLIENT_SECRET=
```

### Setup for DrizzleORM

1. Setup directory

```bash
cd your-repo-name
mkdir src/drizzle/migrations
```

2. Then run the following commands,

- `npm run db:generate` will generate the migrations according to the defined schema.
- Then Run, `npm run db:migrate` will migrate the tables to the local SQLite database.
- Run, `npx drizzle-kit studio` to visualization the SQLite database.

### Run the Application:

```bash
npm run dev
```

### Access the Application:

Open your browser and navigate to http://localhost:3000 to see the application in action.

### Usage:

- Sign Up: Register using an email and password or sign up with Google.
- Login: Authenticate using your registered email and password or Google account.
- Forgot Password: Reset Password with resend.

**Contributions**
Contributions are welcome! Feel free to open issues or submit pull requests to enhance the project.
