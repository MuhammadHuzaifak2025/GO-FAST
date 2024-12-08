"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { toast } from "react-toastify";

export default function Dashboard() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        address: "",
        phone: "",
        name: "",
        account_no: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        const submit = async () => {
            try {
                const resp = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/gofast/api/user/create_admin`,
                    formData,
                    { withCredentials: true },
                );
                let trans_resp = null;
                console.log("User created:", resp.data);
                if (resp.data.data)
                    trans_resp = await axios.post(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/gofast/api/transport_manager`,
                        {
                            user_id: resp.data.data.user_id,
                            name: formData.name,
                            account_no: formData.account_no,
                            email: formData.email,
                        },
                        { withCredentials: true },
                    );
                console.log("Transport Organizer created:", trans_resp.data.message);
                if (trans_resp.data.message) {
                    toast.success("Transport Organizer created successfully");
                    setFormData({
                        username: "",
                        email: "",
                        password: "",
                        address: "",
                        phone: "",
                        name: "",
                        account_no: "",
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to create Transport Organizer");
            }
        };
        await submit();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Create Transport Organizer
                </h1>
                <p className="text-gray-500 mt-2">
                    Add a new transport organizer to the system
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#12b76a]">
                        Transport Organizer Details
                    </CardTitle>
                    <CardDescription>
                        Enter the account and personal details for the new transport
                        organizer
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#12b76a]">
                                User Account Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-[#12b76a]">
                                Transport Organizer Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_no">Account Number</Label>
                                    <Input
                                        id="account_no"
                                        name="account_no"
                                        value={formData.account_no}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#12b76a] hover:bg-[#0e9355] text-white"
                        >
                            Create Transport Organizer
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
