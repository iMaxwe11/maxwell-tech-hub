import Head from 'next/head'

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-10">
      <Head><title>Why I Self-Host My AI Stack</title></Head>
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧠 Why I Self-Host My AI Stack</h1>
        <p>Self-hosting my AI tools gives me privacy, control, and speed.</p>
        <p>I run LLaMA and Mistral in GPU containers, allowing me to experiment with scripting, inference, and prompt tuning without relying on cloud services.</p>
        <p>This home lab setup also lets me understand container orchestration, GPU optimization, and system scaling.</p>
      </main>
    </div>
  )
}
