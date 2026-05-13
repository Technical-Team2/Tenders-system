export default function TestEnvPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  return (
    <div className="p-8">
      <h1>Environment Test</h1>
      <p><strong>NEXT_PUBLIC_API_URL:</strong> {apiUrl || 'NOT FOUND'}</p>
    </div>
  )
}
