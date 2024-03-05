export interface User {
   userId: number;
   firstName: string;
   lastName: string;
   email: string;
   address: string | undefined;
   phone: string | undefined;
   title: string | undefined;
   bio: string | undefined;
   imageUrl: string;
   enabled: boolean;
   createdAt: Date;
   roleName: string;
   permissions: string;
   notLocked: boolean;
   usingMfa: boolean;
}
