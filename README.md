
# Social Media App

This project is a full-stack social media application that allows users to create and share posts, view posts from others, and interact with content in various ways. The app has both a frontend and backend component.

## Frontend

The frontend is built using React Native, with Expo for easier development and testing. The frontend provides the following features:

- User authentication (Login and Signup)
- Displaying a feed of posts from all users
- Posting content with images and GIFs
- Liking, commenting, sharing, and reposting posts
- Viewing user profiles and their posts
- Refreshing the feed with pull-to-refresh

### Technologies Used

- React Native
- Expo
- Axios for API requests
- React Navigation for app navigation
- Redux for state management (optional, not used in this example)
- Icons from Feather (react-native-vector-icons)

## Backend

The backend is built using Node.js and Express. It provides a RESTful API for handling requests from the frontend, including user authentication, post creation, and more.

### API Endpoints

- `POST /auth/login`: Log in a user and return an authentication token.
- `POST /auth/signup`: Register a new user.
- `GET /posts`: Fetch a list of posts (with pagination).
- `POST /posts/create`: Create a new post with content and media.
- `GET /posts/:id`: Get details of a specific post.
- `POST /comments`: Add a comment to a post.
- `POST /like`: Like a post.
- `POST /share`: Share a post.

### Technologies Used

- Node.js
- Express.js
- MongoDB for data storage
- JWT for user authentication
- Multer for handling file uploads

## Setup Instructions

### Backend Setup

1. Clone the repository:

```bash
git clone <repo_url>
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file and configure the following variables:

```bash
MONGODB_URI=<your_mongo_connection_uri>
JWT_SECRET=<your_jwt_secret_key>
PORT=3000
```

4. Run the backend:

```bash
npm start
```

The backend will be running on `http://localhost:3000`.

### Frontend Setup

1. Clone the repository:

```bash
git clone <repo_url>
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file and configure the following variable:

```bash
REACT_APP_API_URL=http://localhost:3000
```

4. Run the frontend:

```bash
npm start
```

The app will be running on Expo, and you can use the Expo client on your phone or emulator.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a new pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.