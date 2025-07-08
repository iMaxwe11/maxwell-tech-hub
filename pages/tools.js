import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Tools() {
  const [ip, setIP] = useState('Loading...')
  const [clipboard, setClipboard] = useState('')
  const [password, setPassword] = useState('')
  const [ping, setPing] = useState(null)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [baseInput, setBaseInput] = useState('')
  const [baseEncoded, setBaseEncoded] = useState('')
  const [baseDecoded, setBaseDecoded] = useState('')

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

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(parsed, null, 2))
    } catch (e) {
      setJsonOutput('❌ Invalid JSON')
    }
  }

  const encodeBase64 = () => {
    setBaseEncoded(btoa(baseInput))
  }

  const decodeBase64 = () => {
    try {
      setBaseDecoded(atob(baseInput))
    } catch (e) {
      setBaseDecoded('❌ Invalid Base64')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-10">
      <Head><title>Tools | Maxwell Nixon</title></Head>
      <main className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center mb-10">🛠 Tech Tools</h1>

        {/* IP Address */}
        <section>
          <h2 className="text-xl font-semibold mb-2">🌐 Your IP Address</h2>
          <p className="bg-white p-3 rounded border">{ip}</p>
        </section>

        {/* Password Generator */}
        <section>
          <h2 className="text-xl font-semibold mb-2">🔐 Password Generator</h2>
          <button onClick={generatePassword} className="bg-blue-700 text-white px-4 py-2 rounded">Generate</button>
          {password && <p className="mt-2 bg-white p-2 rounded border break-all">{password}</p>}
        </section>

        {/* Clipboard */}
        <section>
          <h2 className="text-xl font-semibold mb-2">📋 Clipboard Tester</h2>
          <input value={clipboard} onChange={e => setClipboard(e.target.value)} className="border p-2 rounded w-full mb-2" />
          <button onClick={() => navigator.clipboard.writeText(clipboard)} className="bg-blue-700 text-white px-3 py-2 rounded">Copy</button>
        </section>

        {/* Ping Test */}
        <section>
          <h2 className="text-xl font-semibold mb-2">🛰️ Ping Google</h2>
          <button onClick={testPing} className="bg-blue-700 text-white px-4 py-2 rounded">Test Ping</button>
          {ping !== null && <p className="mt-2">Latency: {ping}ms</p>}
        </section>

        {/* JSON Formatter */}
        <section>
          <h2 className="text-xl font-semibold mb-2">🧮 JSON Formatter</h2>
          <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} rows="5" placeholder="Paste JSON here" className="w-full border p-2 rounded mb-2" />
          <button onClick={formatJson} className="bg-blue-700 text-white px-4 py-2 rounded">Format</button>
          <pre className="bg-white p-3 mt-3 rounded border whitespace-pre-wrap break-words">{jsonOutput}</pre>
        </section>

        {/* Base64 Encode/Decode */}
        <section>
          <h2 className="text-xl font-semibold mb-2">🔐 Base64 Encoder/Decoder</h2>
          <textarea value={baseInput} onChange={e => setBaseInput(e.target.value)} placeholder="Text to encode or decode" rows="3" className="w-full border p-2 rounded mb-2" />
          <div className="space-x-2">
            <button onClick={encodeBase64} className="bg-blue-700 text-white px-4 py-2 rounded">Encode</button>
            <button onClick={decodeBase64} className="bg-green-700 text-white px-4 py-2 rounded">Decode</button>
          </div>
          <p className="mt-2"><strong>Encoded:</strong> {baseEncoded}</p>
          <p><strong>Decoded:</strong> {baseDecoded}</p>
        </section>
      </main>
    </div>
  )
}
