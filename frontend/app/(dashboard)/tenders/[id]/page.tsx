import { TenderDetailPageClient } from './tender-detail-page-client'

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <TenderDetailPageClient id={id} />
}
