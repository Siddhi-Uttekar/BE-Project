export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  aboutCompany?: string;
  responsibilities?: string;
  qualifications?: string;
  benefits?: string;
  createdAt: string;
}
