import Head from 'next/head'
import { useEffect, useState } from 'react'

export default function Tools() {
  const [ip, setIP] = useState('Loading...')
  const [clipboard, setClipboard] = useState('')
  const [password, setPassword] = useState('')
  const [ping, setPing] = useState(null)

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIP(data.ip))
  }, [])

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(result)
  }

  const testPing = async () => {
    const start = Date.now()
    await fetch("https://www.google.com", { mode: 'no-cors' }).catch(() => {})
    const latency = Date.now() - start
    setPing(latency)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-10">
      <Head><title>Tools | Maxwell Nixon</title></Head>
      <main className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center">🛠 Useful Tech Tools</h1>

        <section><h2 className="text-xl font-semibold mb-1">🌐 Your IP Address:</h2><p>{ip}</p></section>
        <section>
          <h2 className="text-xl font-semibold mb-1">🔐 Password Generator</h2>
          <button onClick={generatePassword} className="bg-blue-700 text-white px-4 py-2 rounded">Generate</button>
          <p className="mt-2">{password}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-1">📋 Clipboard Tester</h2>
          <input value={clipboard} onChange={(e) => setClipboard(e.target.value)} className="border p-2 rounded" />
          <button onClick={() => navigator.clipboard.writeText(clipboard)} className="ml-2 bg-blue-700 text-white px-3 py-2 rounded">Copy</button>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-1">🛰️ Ping Test</h2>
          <button onClick={testPing} className="bg-blue-700 text-white px-4 py-2 rounded">Ping Google</button>
          {ping !== null && <p className="mt-2">Latency: {ping}ms</p>}
        </section>
      </main>
    </div>
  )
}
