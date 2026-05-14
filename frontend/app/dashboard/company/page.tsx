import { Metadata } from "next"
import CompanyContent from "./company-content"

export const metadata: Metadata = {
  title: "Company Info - TenderScope",
  description: "Manage your organization's information and intelligence",
}

export default function CompanyPage() {
  return <CompanyContent />
}
