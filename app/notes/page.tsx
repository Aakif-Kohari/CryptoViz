import LearningNotesHub from '../../components/learning/LearningNotesHub'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/footer'

export const metadata = {
  title: 'My Learning Notes | CryptoViz',
  description: 'Manage, edit, and export your personal cybersecurity and cryptography learning notes to Markdown or PDF.',
}

export default function LearningNotesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#060816] text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10"
      >
        <LearningNotesHub />
      </main>

      <Footer />
    </div>
  )
}
