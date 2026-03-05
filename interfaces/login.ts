export interface User {
  id: string;
  email: string;
  password: string; // En producción usar hash
  name: string;
  createdAt: string;
}