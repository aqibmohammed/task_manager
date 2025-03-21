"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams?.get("registered") === "true";

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>();

  useEffect(() => {
    if (isRegistered) {
      setValue("email", ""); // Reset email field if redirected after registration
      toast.success("Account created successfully! You can now sign in.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          // background: "#1e293b",
          color: "black",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });
    }
  }, [isRegistered, setValue]);

  const loginMutation = api.user.login.useMutation({
    onSuccess: () => {
      router.push("/home");
      router.refresh();
    },
    onError: (error) => {
      setError("root", { message: error.message });
      // toast.error(error.message);
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    if (!data.email || !data.password) {
      setError("root", { message: "All fields are required" });
      // toast.error("All fields are required");
      return;
    }

    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Sign In</h1>

        <ToastContainer/>

        {errors.root && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "Email is required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              {...register("password", { required: "Password is required" })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button onClick={() => router.push("/signup")} className="text-blue-600 hover:text-blue-800">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
