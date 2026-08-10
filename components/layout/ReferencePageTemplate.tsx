import type { ReactNode } from "react";
import PageTemplate from "./PageTemplate";
import type { BreadcrumbItem } from "./Breadcrumbs";

interface ReferencePageTemplateProps {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  className?: string;
}

export default function ReferencePageTemplate({
  title,
  description,
  eyebrow = "Reference",
  breadcrumbs = [],
  children,
  className = "",
}: ReferencePageTemplateProps) {
  return (
    <PageTemplate
      category="reference"
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