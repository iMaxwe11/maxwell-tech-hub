import Head from 'next/head'
import Link from 'next/link'

const posts = [
  { title: 'How I Built This Tech Hub', slug: 'how-i-built-this' },
  { title: 'From FiveM to DevOps', slug: 'fivem-to-devops' },
  { title: 'Why I Self-Host My AI Stack', slug: 'self-host-ai' }
]

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-10">
      <Head><title>Blog | Maxwell Nixon</title></Head>
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📘 Blog</h1>
        {posts.map(post => (
          <div key={post.slug} className="mb-6">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <Link href={`/blog/${post.slug}`}><a className="text-blue-600 underline">Read more →</a></Link>
          </div>
        ))}
      </main>
    </div>
  )
}
