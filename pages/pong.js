import Head from 'next/head'
import Script from 'next/script'

export default function Pong() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Head><title>Pong Game</title></Head>
      <main className="flex flex-col items-center justify-center p-10">
        <h1 className="text-3xl font-bold mb-4">🏓 Pong</h1>
        <canvas id="pongCanvas" width="600" height="400" className="border border-white"></canvas>
        <Script src="/pong.js" strategy="afterInteractive" />
      </main>
    </div>
  )
}
