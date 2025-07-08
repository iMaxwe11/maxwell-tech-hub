import Head from 'next/head'
import { useState } from 'react'

export default function Tools() {
  const [jsonInput, setJsonInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [baseInput, setBaseInput] = useState('')
  const [baseEncoded, setBaseEncoded] = useState('')
  const [baseDecoded, setBaseDecoded] = useState('')

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(parsed, null, 2))
    } catch (e) {
      setJsonOutput('Invalid JSON')
    }
  }

  const encodeBase64 = () => {
    setBaseEncoded(btoa(baseInput))
  }

  const decodeBase64 = () => {
    try {
      setBaseDecoded(atob(baseInput))
    } catch (e) {
      setBaseDecoded('Invalid Base64')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-10">
      <Head><title>Tools | Maxwell Nixon</title></Head>
      <main className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center mb-10">🛠 Developer Tools</h1>

        <section>
          <h2 className="text-xl font-semibold mb-2">🧮 JSON Formatter</h2>
          <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder="Paste JSON here" rows="5" className="w-full p-2 border rounded mb-2" />
          <button onClick={formatJson} className="bg-blue-700 text-white px-4 py-2 rounded">Format</button>
          <pre className="bg-gray-200 p-3 rounded mt-3 overflow-auto whitespace-pre-wrap">{jsonOutput}</pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">🔐 Base64 Encoder/Decoder</h2>
          <textarea value={baseInput} onChange={e => setBaseInput(e.target.value)} placeholder="Text to encode/decode" rows="3" className="w-full p-2 border rounded mb-2" />
          <div className="space-x-3">
            <button onClick={encodeBase64} className="bg-blue-700 text-white px-4 py-2 rounded">Encode</button>
            <button onClick={decodeBase64} className="bg-green-700 text-white px-4 py-2 rounded">Decode</button>
          </div>
          <p className="mt-3"><strong>Encoded:</strong> {baseEncoded}</p>
          <p><strong>Decoded:</strong> {baseDecoded}</p>
        </section>
      </main>
    </div>
  )
}
