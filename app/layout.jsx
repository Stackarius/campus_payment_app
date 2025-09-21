import { ToastContainer } from "react-toastify";
import "./globals.css";

export const metadata = {
  title: "Swift",
  description: "A Web based campus payment system",

};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="w-full" 
      >
        {children}
        <ToastContainer position="bottom-center"></ToastContainer>
      </body>
    </html>
  );
}
