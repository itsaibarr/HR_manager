import DashboardLayout from "@/components/layouts/DashboardLayout"

export default function CandidatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
