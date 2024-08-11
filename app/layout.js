import { Inter } from "next/font/google"; // Import the Inter font from Google Fonts
import "./globals.css"; // Import global CSS styles

// Initialize the Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] });

// Metadata for the Pantry Tracker app, including title, description, and developer credit
export const metadata = {
  title: "Pantry Tracker", // Updated title for the Pantry Tracker app
  description: "A simple and efficient way to manage your pantry inventory. Developed by Brian Bazurto.", // Updated description with project details and developer credit
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"> {/* Set the language attribute for accessibility and SEO */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add a viewport meta tag to ensure responsive behavior on mobile devices */}
      </head>
      <body className={inter.className}> {/* Apply the Inter font to the entire body */}
        {children} {/* Render the child components */}
      </body>
    </html>
  );
}
