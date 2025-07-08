import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 text-white p-10">
      <Head><title>Maxwell Nixon | Tech Hub</title></Head>
      <main className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold mb-6">👋 Maxwell's Tech Hub</h1>
        <p className="text-lg mb-10">Projects, tools, experiments — built by me and shared with the world.</p>
        <nav className="flex flex-wrap justify-center gap-4 text-lg font-medium mb-10">
          <Link href="/tools"><a className="hover:underline">🛠 Tools</a></Link>
          <Link href="/blog"><a className="hover:underline">📘 Blog</a></Link>
          <Link href="/projects"><a className="hover:underline">🧩 Projects</a></Link>
          <Link href="/about"><a className="hover:underline">👤 About</a></Link>
          <Link href="/about-terminal"><a className="hover:underline">🖥️ Terminal</a></Link>
          <Link href="/pong"><a className="hover:underline">🏓 Pong</a></Link>
        </nav>
        <p className="text-sm text-gray-300">Built with ❤️ using Next.js + Tailwind CSS</p>
      </main>
    </div>
  )
}
