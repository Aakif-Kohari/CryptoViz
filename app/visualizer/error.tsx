'use client'

import Navbar from '../../components/layout/Navbar'
import RouteErrorUI from '../../components/error/RouteErrorUI'

export default function VisualizerError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300 flex flex-col">
            <Navbar />
            <RouteErrorUI 
                error={error} 
                reset={reset} 
                title="Visualizer Error" 
                message="An error occurred in the visualization system."
            />
        </div>
    )
}
