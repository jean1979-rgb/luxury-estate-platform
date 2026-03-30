import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: "ADMIN" | "BROKER";
      status?: "ACTIVE" | "PENDING" | "SUSPENDED";
      brokerProfileId?: string | null;
      brokerCity?: string | null;
      businessName?: string | null;
    };
  }

  interface User {
    role?: "ADMIN" | "BROKER";
    status?: "ACTIVE" | "PENDING" | "SUSPENDED";
    brokerProfileId?: string | null;
    brokerCity?: string | null;
    businessName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "BROKER";
    status?: "ACTIVE" | "PENDING" | "SUSPENDED";
    brokerProfileId?: string | null;
    brokerCity?: string | null;
    businessName?: string | null;
  }
}
