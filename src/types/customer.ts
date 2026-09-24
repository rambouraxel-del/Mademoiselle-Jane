/**
 * Types préparatoires pour l'intégration future de l'authentification
 * Supabase. Non utilisés en profondeur dans cette v1.
 */

export interface CustomerAddress {
  id: string;
  label?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: CustomerAddress[];
  createdAt: string;
}
