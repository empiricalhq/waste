export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
            <h1 className="mb-4 text-4xl font-bold">Error 404 - Página no encontrada</h1>
            <p className="text-lg">Lo sentimos, la página que buscas no existe.</p>
        </div>
    )
}