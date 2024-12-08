"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import axios from "axios";

const LoginPage = () => {
    const [user, setUser] = useState({});
    const [authenticated, setisAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const submit = async () => {
            try {
                const resp = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/gofast/api/user/login`,
                    {
                        username: event.currentTarget.email.value,
                        password: event.currentTarget.password.value,
                    },
                    { withCredentials: true },
                );
                if (resp) {
                    console.log(resp);
                    console.log(resp?.data?.data?.is_super_admin);
                    if (resp?.data?.data?.is_super_admin === false) {
                        toast.error(
                            "You are not an admin. Please login with an admin account.",
                        );
                    } else {
                        console.log("hello world");
                        toast.success("Successfully logged in");
                        router.push("/admin");
                    }
                }
            } catch (error) {
                console.log(error);
                toast.error("Invalid email or password. Please try again.");
                // alert("Invalid email or password. Please try again.");
            }
        };
        submit();
        console.log("Login attempted");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
            <Card className="w-full max-w-md">
                <CardHeader className="">
                    <div className="flex justify-center">
                        <Image
                            src="/logo-removebg-preview.png"
                            alt="Carpool & Buspool Logo"
                            width={200}
                            height={200}
                            className="rounded-lg"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-[#12b76a]">
                        Login to Your Account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2 rounded-lg">
                            <Label htmlFor="email" className="rounded-lg">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="text  "
                                placeholder=""
                                required
                                className="border rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#12b76a] hover:bg-[#0e9355] text-white"
                        >
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
