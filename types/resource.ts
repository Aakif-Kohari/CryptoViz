export type ResourceCategory =
  | "Book"
  | "Research Paper"
  | "RFC"
  | "NIST"
  | "Video"
  | "External";

export type Difficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  difficulty: Difficulty;
  tags: string[];
  link: string;
}