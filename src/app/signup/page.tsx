"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";

interface SignUpFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
  }
  
  export default function SignUp() {
	const router = useRouter();
  
	const {
	  register,
	  handleSubmit,
	  watch,
	  setError,
	  formState: { errors, isSubmitting },
	} = useForm<SignUpFormData>();
  
	const registerMutation = api.user.registerUser.useMutation({
	  onSuccess: () => {
		router.push("/signin?registered=true");
	  },
	  onError: (error) => {
		setError("root", { message: error.message }); // Handling API error
	  },
	});
  
	const onSubmit = async (data: SignUpFormData) => {
	  if (data.password.length < 6) {
		setError("password", { message: "Password must be at least 6 characters" });
		return;
	  }
  
	  if (data.password !== data.confirmPassword) {
		setError("confirmPassword", { message: "Passwords do not match" });
		return;
	  }
  
	  // Register user
	  registerMutation.mutate({
		username: data.username,
		email: data.email,
		password: data.password,
	  });
	};
  
	return (
	  <div className="flex min-h-screen items-center justify-center bg-gray-50">
		<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
		  <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Create an Account</h1>
  
		  {errors.root && (
			<div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
			  {errors.root.message}
			</div>
		  )}
  
		  <form onSubmit={handleSubmit(onSubmit)}>
			<div className="mb-4">
			  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
				Username
			  </label>
			  <input
				type="text"
				id="username"
				{...register("username", { required: "Username is required" })}
				className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
			  />
			  {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
			</div>
  
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
  
			<div className="mb-4">
			  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
				Password
			  </label>
			  <input
				type="password"
				id="password"
				{...register("password", { required: "Password is required" })}
				className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
			  />
			  {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
			</div>
  
			<div className="mb-6">
			  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
				Confirm Password
			  </label>
			  <input
				type="password"
				id="confirmPassword"
				{...register("confirmPassword", { required: "Please confirm your password" })}
				className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
			  />
			  {errors.confirmPassword && (
				<p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
			  )}
			</div>
  
			<button
			  type="submit"
			  disabled={isSubmitting}
			  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
			>
			  {isSubmitting ? "Creating account..." : "Sign Up"}
			</button>
		  </form>
  
		  <p className="mt-4 text-center text-sm text-gray-600">
			Already have an account?{" "}
			<button onClick={()=>router.push("/signin")} className="text-blue-600 hover:text-blue-800">
			  Sign in
			</button>
		  </p>
		</div>
	  </div>
	);
  }