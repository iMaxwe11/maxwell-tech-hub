import Head from 'next/head'

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-10">
      <Head><title>How I Built This Tech Hub</title></Head>
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧱 How I Built This Tech Hub</h1>
        <p>I started from scratch with Next.js and Tailwind.</p>
        <p>Then I layered in real tools: IP checker, clipboard tester, pong, password generator, blog pages, and newsletter signup — all custom-built.</p>
        <p>Every section was carefully designed to be useful, responsive, and personal.</p>
      </main>
    </div>
  )
}
