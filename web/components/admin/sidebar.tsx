"use client";
import Link from "next/link";
import { Home, Users, Truck, LogOut, Router } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function Sidebar() {
  const router = useRouter();
  return (
    <div className="w-64 h-full bg-gray-50 border-r flex flex-col justify-between">
      {/* Header */}
      <div>
        <Image
          src="/logo-removebg-preview.png"
          alt="GoFast Logo"
          width={150}
          height={150}
          className="rounded-lg flex justify-center items-center mx-auto my-4"
        />
        {/* Navigation Links */}
        <nav className="mt-4">
          <Link
            href="/admin"
            className="group flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#12b76a]"
          >
            <Home
              className="mr-3 text-gray-500 group-hover:text-[#12b76a]"
              size={20}
            />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="group flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#12b76a]"
          >
            <Users
              className="mr-3 text-gray-500 group-hover:text-[#12b76a]"
              size={20}
            />
            Users
          </Link>
          <Link
            href="/admin/transport-organizers"
            className="group flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#12b76a]"
          >
            <Truck
              className="mr-3 text-gray-500 group-hover:text-[#12b76a]"
              size={20}
            />
            Transport Organizers
          </Link>
        </nav>
      </div>
      {/* Logout */}
      <div className="mb-4">
        <div
          onClick={async () => {
            try {
              const resp = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/gofast/api/user/logout`,
                {},
                { withCredentials: true }
              );
              if (resp) {
                toast.success("Logged out successfully");
                router.push("/");
              }
            } catch (error) {
              console.error(error);
              toast.error("Failed to logout");
            }
          }}
          className="group cursor-pointer  flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-red-600"
        >
          <LogOut
            className="mr-3 text-gray-500 group-hover:text-red-600"
            size={20}
          />
          Logout
        </div>
      </div>
    </div>
  );
}
