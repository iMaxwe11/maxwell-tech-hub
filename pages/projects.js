import Head from 'next/head'

export default function Projects() {
  const projects = [
    {
      title: "Smart Data Pipeline",
      desc: "FastAPI + Streamlit + CI/CD + Docker",
      link: "https://github.com/iMaxwe11/smart-data-pipeline"
    },
    {
      title: "FiveM Modding Server",
      desc: "Custom GTA V mod loader, hosted server, and admin tools",
      link: "https://github.com/iMaxwe11"
    },
    {
      title: "AI Home Lab",
      desc: "Self-hosted GPU containers for LLaMA + Mistral",
      link: "https://github.com/iMaxwe11"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-10">
      <Head><title>Projects | Maxwell Nixon</title></Head>
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🧩 Projects</h1>
        {projects.map((p) => (
          <div key={p.title} className="mb-6">
            <h2 className="text-2xl font-semibold">{p.title}</h2>
            <p>{p.desc}</p>
            <a href={p.link} target="_blank" className="text-blue-700 underline">View on GitHub</a>
          </div>
        ))}
      </main>
    </div>
  )
}
