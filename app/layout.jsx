import { ToastContainer } from "react-toastify";
import "./globals.css";

export const metadata = {
  title: "Swift",
  description: "A Web based campus payment system",

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="w-full"
      >
        <ToastContainer></ToastContainer>
        {children}
      </body>
    </html>
  );
}
