# Fanhaven - Social Media Platform

Fanhaven is a modern social media platform built using **Next.js** and various powerful technologies like **NextAuth** for authentication, **Cloudinary** for media storage, **MongoDB** for the database, and **TailwindCSS** for responsive styling. The platform allows users to create profiles, add posts, interact with premium content, and more. It includes an authentication system with **Google** and **GitHub** login, as well as a dynamic dashboard for users to manage their details, posts, and subscriptions.

### Key Features:
- **Authentication**: Sign up and log in using **Google** or **GitHub** with **NextAuth**.
- **User Profiles**: Users can create their profiles, upload profile/cover pictures, and manage their social media links, bio, and premium content settings.
- **Premium Content**: Users can add premium posts that are only accessible to subscribers, with the ability to set a price for accessing this content.
- **Home Feed**: Users can see recent posts from profiles they follow, with a clean navigation bar for easy browsing.
- **Search Functionality**: Quickly search for users by their name or profile data.
- **Post Interactions**: Like and dislike posts, and view individual posts with additional details.
- **Cloudinary Integration**: User images and media files are stored using **Cloudinary** for seamless file management and scalability.
- **Responsive Design**: Built with **TailwindCSS** for a clean, mobile-responsive UI.

### Tech Stack:
- **Frontend**: Next.js, React.js, TailwindCSS, React Icons
- **Backend**: MongoDB, Mongoose, NextAuth (for authentication), Cloudinary
- **Authentication**: Google and GitHub login via NextAuth
- **Media Storage**: Cloudinary for handling user images and posts

---
###Screenshots:
- **Login Page**:
- ![Screenshot 2024-12-12 213829](https://github.com/user-attachments/assets/864db1c2-5535-429b-ae08-c488c2531ab9)
- **Home Page**:
  ![Screenshot 2024-12-12 214316](https://github.com/user-attachments/assets/0ded123c-5334-4c82-a077-71640ab05df7)
  **Dashboard Page**:
  ![Screenshot 2024-12-12 213950](https://github.com/user-attachments/assets/c4da71b7-a693-4278-8596-340a813add47)
  ![Screenshot 2024-12-12 214009](https://github.com/user-attachments/assets/b7d55c82-ff1b-4258-b708-f58352e78c64)
  **Profile Page**:
  ![Screenshot 2024-12-12 214048](https://github.com/user-attachments/assets/b9553cee-19e1-496f-94c8-9f8c340b2b77)
  ![Screenshot 2024-12-12 214103](https://github.com/user-attachments/assets/72f8b0b7-cdb9-41f9-b6d9-84486a88d4ed)
  **View Posts Page**:
  ![Screenshot 2024-12-12 214543](https://github.com/user-attachments/assets/c3fa1749-6b0f-416e-828d-11c52021e4d6)
  




## Getting Started

Follow these steps to set up the project locally:

1. Clone the Repository

git clone https://github.com/RohithGYadav/fanhaven.git

cd fanhaven

2. Set Up Environment Variables
Create a .env.local file in the root directory, and copy the contents of .env.sample into it. Then, replace the placeholders with your own values.

3. Install Dependencies
Run the following command to install all necessary dependencies:
npm install

4. Run the Application
To start the development server, run:
npm run dev

This will start the application at http://localhost:3000.

5. Set Up MongoDB
Ensure that MongoDB is running locally or use a MongoDB Atlas cluster. MongoDB collections will be automatically created based on the Mongoose models defined in the models/ directory.

Cloudinary Integration
Fanhaven uses Cloudinary to handle image uploads (such as profile and cover photos) and media content for posts. To use Cloudinary:

Create an account on Cloudinary.
Obtain your Cloud Name, API Key, and API Secret.
Set the corresponding environment variables in your .env.local file as described above.


