export interface LoginRequestInterface {
  email: string;
  password: string;
}

export interface updateProfilRequestInterface {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  title: string;
  bio: string;
}

export interface updateProfilePasswordRequestInterface {
  password: string;
  newPassword: string;
  confirmPassword: string;
}
