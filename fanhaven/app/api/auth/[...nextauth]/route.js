import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

// Define NextAuth options
const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email; // Get the user's email
      const username = email.split('@')[0]; // Extract the part of the email before the '@'

      await dbConnect(); // Ensure the database is connected

      // Check if a user document with this email already exists
      const existingUser = await User.findOne({ email });
      
      if (!existingUser) {
        // If not, create a new user document with the email and username
        await User.create({
          email,
          user: username, // Store the part of the email before the '@' as the user
          username: username, // Set the same for username or leave it empty if it's not provided
          razorpayId: 'defaultRazorpayId', // Set a default value
          razorpaySecret: 'defaultRazorpaySecret', // Set a default value
          // Initialize other fields as needed
        });
      }

      return true; // Allow the sign-in
    },
    async session({ session, token }) {
      if (token && token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user; // Set user data here
      }
      return token;
    }
  }
};

// Named export for GET request
export const GET = (req, res) => NextAuth(req, res, authOptions);

// Named export for POST request
export const POST = (req, res) => NextAuth(req, res, authOptions);
