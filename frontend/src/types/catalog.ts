export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  location?: string | null;
  phoneExt?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  doctors?: { id: string; fullName: string }[];
}

export interface Specialization {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
}
