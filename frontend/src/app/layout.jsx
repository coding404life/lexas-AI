import "./globals.css";

export const metadata = {
  title: "SuperCar Virtual Sales Assistant",
  description: "AI-powered sales assistant for SuperCar dealerships",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
