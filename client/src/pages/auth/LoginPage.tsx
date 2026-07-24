import { LoginForm } from "@/components/auth/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold">Book Management</h1>

        <p className="mb-8 text-center text-gray-500">Sign in to continue</p>

        <LoginForm />
      </div>
    </div>
  );
}
