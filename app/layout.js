import "./globals.css";

export const metadata = {
  title: "Trademarkia",
  description: "Search page",
  openGraph: {
    title: "Trademarkia",
    description: "Search page",
    images: [
      {
        url: "https://res.cloudinary.com/davqsdhdv/image/upload/v1743254310/logo-removebg-preview_t17kzs.png", // Replace with the actual image path
        width: 1200,
        height: 630,
        alt: "Trademarkia",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="Create Next App" />
        <meta property="og:description" content="Search page" />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/davqsdhdv/image/upload/v1743254310/logo-removebg-preview_t17kzs.png"
        />
        <meta property="og:type" content="website" />
        <link
          rel="icon"
          type="image/png"
          href="https://res.cloudinary.com/davqsdhdv/image/upload/v1743254310/logo-removebg-preview_t17kzs.png"
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
