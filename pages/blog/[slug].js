import { useRouter } from 'next/router'
import Head from 'next/head'

export default function BlogPost() {
  const { query } = useRouter()
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-10">
      <Head><title>{query.slug} | Blog</title></Head>
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">📝 {query.slug?.replace(/-/g, ' ')}</h1>
        <p>This is placeholder content for the blog post. Customize this file for each blog post slug.</p>
      </main>
    </div>
  )
}
