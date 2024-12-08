"use client";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Iphone15Pro from "@/components/ui/iphone-15-pro";
import { cn } from "@/lib/utils";
import {
    ArrowRightIcon,
    Download,
    Github,
    Linkedin,
    Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Colors } from "@/constants/Color";
import Features from "@/components/Features";

import { features, FeatureSection, HeroSection } from "@/constants/seo";
import PulsatingButton from "@/components/ui/pulsating-button";

export default function Page() {
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };
    return (
        <>
            {/* Navbar / Tab bar  */}
            <section className="container overflow-hidden bg-white/5 mx-auto">
                <div className="relative w-full mx-auto max-w-7xl">
                    <div
                        className="relative flex flex-col w-full p-5 mx-auto lg:px-16 md:flex-row md:items-center md:justify-between md:px-6"
                        x-data="{ open: false }"
                    >
                        <div className="flex flex-row items-center justify-between text-sm text-black lg:justify-start">
                            <Link href="/">
                                <div className="inline-flex items-center gap-3">
                                    <Image
                                        src="/logo.png"
                                        alt="Carpool & Buspool Logo"
                                        color="black"
                                        width={120}
                                        height={120}
                                        className="rounded-lg"
                                    />
                                </div>
                            </Link>
                        </div>
                        <nav
                            className={`align-middle flex-col items-center flex-grow hidden md:flex md:flex-row md:justify-end md:pb-0 md:space-x-6 ${isOpen ? "flex" : "hidden"
                                }`}
                        >
                            <Link
                                href="/login"
                                className="active:bg-fuchsia-50 active:text-black bg-[#12b76a] focus-visible:outline-2 focus-visible:outline-fuchsia-50 focus-visible:outline-offset-2 focus:outline-none group hover:bg-[#fff]/5 hover:text-[#fff] justify-center px-6 py-2 rounded-full text-[#fff] text-sm"
                            >
                                Admin Panel
                            </Link>
                        </nav>
                    </div>
                </div>
            </section>

            {/* Shiny Text */}
            <div className="z-10 flex min-h-64 items-center justify-center">
                <div
                    className={cn(
                        "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800",
                    )}
                >
                    <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                        <span>✨ Introducing GO Fast</span>
                        <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                    </AnimatedShinyText>
                </div>
            </div>

            {/* Hero section */}
            <section className="mb-8 mx-auto">
                <div className="grid grid-cols-2 justify-center justify-items-center">
                    <div>
                        <h1
                            className={`max-w-2xl text-5xl font-bold mb-12 tracking-tighter mx-auto text-[${Colors.light.primary}]`}
                        >
                            {HeroSection.heading}
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl mb-8 font-medium text-balance">
                            {HeroSection.text}
                        </p>
                        <div className="max-w-2xl mx-auto text-xl mb-8 font-medium text-balance">
                            <PulsatingButton className="bg-[#12b76a]" pulseColor="#12b76a">
                                Download APK
                            </PulsatingButton>
                        </div>
                    </div>
                    <div className="w-3/4 flex mx-auto">
                        <div className="w-60 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0 mx-auto ">
                            <Iphone15Pro
                                className="size-full"
                                src="https://via.placeholder.com/430x880"
                            />
                        </div>
                        {/*
                        <div className="w-60 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0 ">
                            <Iphone15Pro
                                className="size-full"
                                src="https://via.placeholder.com/430x880"
                            />
                        </div>
                        <div className="w-60 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0 ">
                            <Iphone15Pro
                                className="size-full"
                                src="https://via.placeholder.com/430x880"
                            />
                        </div> */}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="sm:py-20 py-12 container px-10">
                <div className="text-center space-y-4 pb-10 mx-auto">
                    <h1 className="mx-0 mt-4 max-w-lg text-5xl text-balance font-bold sm:max-w-none sm:text-4xl md:text-5xl lg:text-6xl leading-[1.2] tracking-tighter text-foreground ">
                        {FeatureSection.heading}
                    </h1>
                    <p>{FeatureSection.text}</p>
                </div>

                <div>
                    {features.map((feature, index) => (
                        <Features
                            key={index}
                            heading={feature.heading}
                            text={feature.text}
                            src={feature.src}
                            isLeft={feature.isLeft}
                        />
                    ))}
                </div>
            </section>
        </>
    );
}

function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white text-[#12b76a]">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-[#12b76a]">
                <Link className="flex items-center justify-center" href="#">
                    <Image
                        src="/logo.png"
                        alt="Carpool & Buspool Logo"
                        color="black"
                        width={120}
                        height={120}
                        className="rounded-lg"
                    />
                    {/* <span className="ml-2 text-lg font-bold text-[#12b76a]">Carpool & Buspool</span> */}
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link
                        className=" text-lg font-medium hover:text-[#12b76a] transition-colors"
                        href="/login"
                    >
                        Admin Panel
                    </Link>
                </nav>
            </header>
            <main className="flex-1">
                <section className="w-full pt-12 md:pt-24 lg:pt-32 xl:pt-48 pb-8 md:pb-20 lg:pb-28 xl:pb-44  bg-[#f3f3f398] border rounded-xl">
                    <div className="px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-black">
                                    Welcome to{" "}
                                    <span className="text-[#12b76a]">Carpool & Buspool</span>
                                </h1>
                                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                                    Your go-to solution for convenient and eco-friendly
                                    transportation. Download our app and join the community today!
                                </p>
                            </div>
                            <div className="space-x-4">
                                <Button
                                    asChild
                                    className="bg-[#12b76a] hover:bg-[#0e9355] text-white"
                                >
                                    <Link href="#download">Download APK</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-[#12b76a] text-[#12b76a] hover:bg-[#12b76a] hover:text-white"
                                >
                                    <Link href="#developers">Meet Our Developers</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="developers" className="w-full mt-10">
                    <div className="px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl space-y-2">
                                    Meet Our Developers
                                </h2>
                                <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    The talented team behind Carpool & Buspool. Connect with us
                                    and learn more about our journey.
                                </p>
                            </div>
                            <div className="flex justify-between w-2/4 pt-6">
                                {[
                                    { name: "Ilyas Moiz", role: "Frontend Developer" },
                                    { name: "Muhammad Huzaifa", role: "Backend Developer" },
                                    { name: "Daniyal Saeed Dani", role: "Full Stack" },
                                ].map((developer) => (
                                    <Card
                                        key={developer.name}
                                        className="bg-gray-900 border-[#12b76a]"
                                    >
                                        <CardContent className="p-4 flex flex-col items-center space-y-2 w-48">
                                            <Image
                                                alt={developer.name}
                                                className="rounded-full"
                                                height="80"
                                                src="/placeholder.svg?height=80&width=80"
                                                style={{
                                                    aspectRatio: "80/80",
                                                    objectFit: "cover",
                                                }}
                                                width="80"
                                            />
                                            <h3 className="font-semibold text-[#12b76a]">
                                                {developer.name}
                                            </h3>
                                            <p className="text-sm text-gray-400">{developer.role}</p>
                                            <div className="flex space-x-2">
                                                <Link
                                                    className="text-gray-400 hover:text-[#12b76a]"
                                                    href="#"
                                                >
                                                    <Github className="h-5 w-5" />
                                                    <span className="sr-only">GitHub</span>
                                                </Link>
                                                <Link
                                                    className="text-gray-400 hover:text-[#12b76a]"
                                                    href="#"
                                                >
                                                    <Linkedin className="h-5 w-5" />
                                                    <span className="sr-only">LinkedIn</span>
                                                </Link>
                                                <Link
                                                    className="text-gray-400 hover:text-[#12b76a]"
                                                    href="#"
                                                >
                                                    <Twitter className="h-5 w-5" />
                                                    <span className="sr-only">Twitter</span>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-[#12b76a] mt-12">
                <p className="text-xs text-gray-400">
                    © 2024 Carpool & Buspool. All rights reserved.
                </p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6"></nav>
            </footer>
        </div>
    );
}
