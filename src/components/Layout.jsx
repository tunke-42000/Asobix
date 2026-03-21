import Header from './Header'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
