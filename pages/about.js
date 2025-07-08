import Head from 'next/head'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 text-gray-900 p-10">
      <Head><title>About | Maxwell Nixon</title></Head>
      <main className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">👨‍💻 About Me</h1>
        <p className="mb-4">I'm an IT technician and builder with a passion for automation, self-hosted tools, and custom solutions.</p>
        <ul className="list-disc ml-5 mb-4">
          <li>💻 Tech stack: Next.js, Tailwind CSS, GitHub Actions, Docker</li>
          <li>📚 Interests: AI tooling, systems optimization, game modding</li>
        </ul>
        <p>Reach me at <a className="text-blue-700 underline" href="mailto:mnixon112@outlook.com">mnixon112@outlook.com</a></p>
      </main>
    </div>
  )
}
