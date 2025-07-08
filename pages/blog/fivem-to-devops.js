import Head from 'next/head'

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-10">
      <Head><title>From FiveM to DevOps</title></Head>
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🎮 From FiveM to DevOps</h1>
        <p>Running a FiveM server taught me system management, uptime accountability, scripting, and even user support.</p>
        <p>I managed mod updates, backups, performance tuning, and remote restarts — all things that directly apply to IT operations today.</p>
        <p>It was my first real experience with full-stack responsibility and troubleshooting under pressure.</p>
      </main>
    </div>
  )
}
