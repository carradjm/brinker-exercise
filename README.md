# Take Home Exercise

## Building the Applications

### Backend

1. Navigate to `/backend` from the root directory:

    ```bash
    cd backend && yarn install
    ```

2. Build the backend application:

    ```bash
    npm run build
    ```

### Frontend

1. Navigate to `/frontend` from the root directory:

    ```bash
    cd frontend && yarn install
    ```

2. Build the frontend application:

    ```bash
    npm run build
    ```

## Running the Applications

Start both backend and frontend concurrently from the root directory:

```bash
npm run start
```

- **Backend:** [http://localhost:3001](http://localhost:3001)
- **Frontend:** [http://localhost:3000](http://localhost:3000)

## Usage

1. **Register a New User**

    - Open [http://localhost:3000](http://localhost:3000) in your browser.
    - Navigate to the **Register** page.
    - Fill out the registration form to create a new user account.
    - User registration is required so that the user has a JWT token.

2. **Create / View / Edit / Delete Products**

    - After registering, navigate to the **Login** page.
    - Enter your newly created credentials to log in.
    - Upon successful login, you can access the list of products.
    - Products can be created, edited, viewed, and deleted from this page.

---

Please let me know if you have any questions or if anything isn't working!
