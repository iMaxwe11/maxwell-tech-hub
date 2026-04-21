"use client";

import Link from "next/link";

export default function CreditsPage() {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Starfield background */}

      {/* Star Wars crawl style credits */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 perspective">
        <style>{`
          @keyframes crawl {
            0% {
              opacity: 0;
              transform: translateY(100vh) rotateX(60deg);
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translateY(-100vh) rotateX(60deg);
            }
          }

          .crawl-container {
            perspective: 600px;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .crawl {
            animation: crawl 45s linear infinite;
            text-align: center;
            max-width: 600px;
            position: relative;
            z-index: 10;
          }

          .crawl h1 {
            font-size: 4rem;
            font-weight: 900;
            color: #f5f5f5;
            margin: 2rem 0;
            letter-spacing: 2px;
            background: linear-gradient(to right, #06b6d4, #a855f7, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
            font-family: 'Courier New', monospace;
          }

          .crawl h2 {
            font-size: 1.5rem;
            color: #a855f7;
            margin: 2rem 0 1rem 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-family: 'Courier New', monospace;
          }

          .crawl p {
            font-size: 1rem;
            color: #ffffff;
            margin: 1rem 0;
            line-height: 1.8;
            font-family: 'Courier New', monospace;
          }

          .crawl ul {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
          }

          .crawl li {
            font-size: 0.9rem;
            color: #e0e0e0;
            margin: 0.5rem 0;
            font-family: 'Courier New', monospace;
          }

          .crawl .section {
            margin: 3rem 0;
          }

          .back-link {
            position: fixed;
            bottom: 4rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 20;
            text-decoration: none;
            color: #06b6d4;
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
            border: 1px solid #06b6d4;
            border-radius: 0.25rem;
            transition: all 0.3s ease;
            background: rgba(6, 182, 212, 0.05);
            backdrop-filter: blur(10px);
          }

          .back-link:hover {
            background: rgba(6, 182, 212, 0.15);
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
          }
        `}</style>

        <div className="crawl-container">
          <div className="crawl">
            <h1>MAXWELLNIXON.COM</h1>

            <div className="section">
              <h2>Directed by</h2>
              <p>Maxwell Nixon</p>
            </div>

            <div className="section">
              <h2>Produced by</h2>
              <p>Too much coffee and Claude AI</p>
            </div>

            <div className="section">
              <h2>Starring</h2>
              <ul>
                <li>Next.js 15</li>
                <li>TypeScript</li>
                <li>React</li>
                <li>Framer Motion</li>
                <li>Tailwind CSS</li>
                <li>Vercel</li>
              </ul>
            </div>

            <div className="section">
              <h2>Special Thanks</h2>
              <ul>
                <li>GitHub Copilot</li>
                <li>Stack Overflow</li>
                <li>The Verge RSS Feed</li>
                <li>NASA Open APIs</li>
                <li>Anthropic Claude</li>
              </ul>
            </div>

            <div className="section">
              <p style={{ fontSize: "0.85rem", color: "#888" }}>
                No frameworks were harmed in the making of this website.
              </p>
            </div>

            <div className="section">
              <p style={{ fontSize: "1.2rem", color: "#f59e0b" }}>
                Easter eggs hidden: 5 😉
              </p>
            </div>

            <div style={{ height: "100vh" }}></div>
          </div>
        </div>

        <Link href="/" className="back-link">
          ← Back to reality
        </Link>
      </div>
    </div>
  );
}
