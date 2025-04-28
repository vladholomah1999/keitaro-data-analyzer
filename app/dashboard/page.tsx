import { DataAnalyzer } from "@/components/data-analyzer"
import { Header } from "@/components/header"
import { AuthCheck } from "@/components/auth/auth-check"

export default function DashboardPage() {
  return (
    <AuthCheck>
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto pb-20">
          <DataAnalyzer />
        </div>
      </main>
    </AuthCheck>
  )
}
