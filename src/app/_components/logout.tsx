"use client";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const router = useRouter();

  const { mutate, isPending } = api.user.logoutSafe.useMutation({
    onSuccess() {
      // Show a success toast notification before redirecting
      toast.success("Successfully logged out");
      router.push("/?loggedout=true");
    },
    onError(error) {
      // Handle logout errors
      toast.error(`Logout failed: ${error.message}`);
    }
  });

  return (
    <div className="flex relative  justify-end ">
      <button
        disabled={isPending}
        onClick={() => mutate()}
        className={`flex flex-row justify-center items-center gap-2 text-sm bg-red-300  text-red-700 hover:bg-red-400  rounded-lg p-2 ${isPending ? 'opacity-50 cursor-not-allowed ' : ''}`}
      >
        {isPending ? "Logging out..." : "Logout"}
        <LogOut size={16} className="text-red-700"/>
      </button>
    </div>
  );
};

export default LogoutButton;