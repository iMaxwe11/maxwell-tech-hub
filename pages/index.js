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
		<section className="bg-white p-6 rounded shadow mt-12 max-w-xl mx-auto text-left">
  <h2 className="text-xl font-semibold mb-2 text-gray-900">📬 Subscribe to My Newsletter</h2>
  <form
    action="https://buttondown.email/api/emails/embed-subscribe/maxwellnixon"
    method="post"
    target="popupwindow"
    onSubmit={() => window.open('https://buttondown.email/maxwellnixon', 'popupwindow')}
    className="space-y-2"
  >
    <input
      type="email"
      name="email"
      placeholder="you@example.com"
      required
      className="w-full p-2 border rounded"
    />
    <input type="hidden" name="embed" value="1" />
    <button
      type="submit"
      className="bg-blue-700 text-white px-4 py-2 rounded"
    >
      Subscribe
    </button>
    <p className="text-sm text-gray-600">No spam. Just real dev content from me.</p>
  </form>
</section>
      </main>
    </div>
  )
}
