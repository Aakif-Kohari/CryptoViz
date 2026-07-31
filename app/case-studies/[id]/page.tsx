import { notFound } from 'next/navigation'
import CaseStudyDetail from '../../../components/case-studies/CaseStudyDetail'
import { CASE_STUDIES } from '../../../lib/case-studies/data'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({
    id: study.id,
  }))
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const study = CASE_STUDIES.find((s) => s.id === id)
  if (!study) {
    return {
      title: 'Case Study Not Found | CryptoViz',
    }
  }

  return {
    title: `${study.title} | Cryptographic Case Studies | CryptoViz`,
    description: study.subtitle,
  }
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { id } = await params
  const study = CASE_STUDIES.find((s) => s.id === id)

  if (!study) {
    notFound()
  }

  return <CaseStudyDetail study={study} />
}
