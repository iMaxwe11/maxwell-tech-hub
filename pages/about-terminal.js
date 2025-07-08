import Head from 'next/head'
import { useState } from 'react'

export default function AboutTerminal() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <Head><title>About (Terminal) | Maxwell Nixon</title></Head>
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">👨‍💻 About Terminal</h1>
        <button onClick={() => setOpen(!open)} className="bg-green-500 text-black px-4 py-2 rounded font-mono">
          {open ? "Close Terminal" : "Open Terminal"}
        </button>
        {open && (
          <div className="mt-6 bg-black text-green-400 p-6 rounded font-mono shadow-inner space-y-2">
            <p>user@maxwell:~$ whoami</p>
            <p>→ IT Technician, Cloud Builder, DevOps Learner</p>
            <p>user@maxwell:~$ cat interests.txt</p>
            <p>→ AI | Home Labs | Self-Hosting | Game Servers</p>
            <p>user@maxwell:~$ tail -n 3 resume.txt</p>
            <p>→ Built a data pipeline using FastAPI + Streamlit</p>
            <p>→ Hosted FiveM server with mod loader & automation</p>
            <p>→ Self-hosted LLaMA on GPU lab (offline inference)</p>
          </div>
        )}
      </main>
    </div>
  )
}
