import type { ReactNode } from "react";
import PageTemplate from "./PageTemplate";
import type { BreadcrumbItem } from "./Breadcrumbs";

interface PracticePageTemplateProps {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  className?: string;
}

export default function PracticePageTemplate({
  title,
  description,
  eyebrow = "Practice workspace",
  breadcrumbs = [],
  children,
  className = "",
}: PracticePageTemplateProps) {
  return (
    <PageTemplate
      category="practice"
      title={title}
      description={description}
      eyebrow={eyebrow}
      breadcrumbs={breadcrumbs}
      className={className}
    >
      {children}
    </PageTemplate>
  );
}