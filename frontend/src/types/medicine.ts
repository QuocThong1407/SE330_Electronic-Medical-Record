export interface Medicine {
  id: string;
  categoryId: string;
  categoryName?: string;
  code: string;
  name: string;
  unit: MedicineUnit;
  manufacturer?: string;
  description?: string;
  sideEffects?: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum MedicineUnit {
  TABLET = "TABLET",
  CAPSULE = "CAPSULE",
  SYRUP = "SYRUP",
  ML = "ML",
  MG = "MG",
  VIAL = "VIAL",
  TUBE = "TUBE",
  PACK = "PACK",
  BOX = "BOX"
}

export interface MedicineCategory {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface MedicineCreateRequest {
  categoryId: string;
  code: string;
  name: string;
  unit: MedicineUnit | undefined;
  manufacturer?: string;
  description?: string;
  sideEffects?: string;
  price: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface MedicineUpdateRequest {
  categoryId: string;
  code: string;
  name: string;
  unit: MedicineUnit;
  manufacturer?: string;
  description?: string;
  sideEffects?: string;
  price: number;
}

export interface MedicineStatusRequest {
  isActive: boolean;
}

export interface MedicineStockRequest {
  quantity: number;
}