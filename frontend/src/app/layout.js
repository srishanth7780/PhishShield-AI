import "./globals.css";

export const metadata = {
  title: "PhishShield AI | Interactive Anti-Phishing & Scam Detection Engine",
  description:
    "An interactive cyber scam detection engine powered by Naive Bayes NLP, Rule-Based Knowledge Base, and Deep LLM Threat Analysis.",
  keywords: [
    "Anti-Phishing Engine",
    "Phishing Detection",
    "Scam Detector",
    "Machine Learning",
    "Naive Bayes",
    "Forward Chaining",
    "Cybersecurity AI",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface-900 text-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}

