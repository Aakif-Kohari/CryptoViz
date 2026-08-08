'use client'

import Navbar from '../../../components/layout/Navbar'
import RouteErrorUI from '../../../components/error/RouteErrorUI'

export default function CipherError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300 flex flex-col">
            <Navbar />
            <RouteErrorUI 
                error={error} 
                reset={reset} 
                title="Cipher Error" 
                message="This specific cryptographic visualizer encountered an error."
            />
        </div>
    )
}
