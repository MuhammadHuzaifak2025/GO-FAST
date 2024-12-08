import Iphone15Pro from "@/components/ui/iphone-15-pro";
import { FadeText } from "./ui/fade-text";
import WordFadeIn from "./ui/word-fade-in";
import BlurFade from "./ui/blur-fade";
import PulsatingButton from "./ui/pulsating-button";

const Features = ({ src, heading, text, isLeft }) => {
    return (
        <>
            {isLeft ? (
                <div className="flex flex-col items-center justify-between pb-10 transition-all duration-500 ease-out lg:flex-row-reverse">
                    <div className="w-full lg:w-1/2">
                        <div className="w-full max-w-[300px] mx-auto">
                            <Iphone15Pro
                                className="size-full"
                                src="https://via.placeholder.com/430x880"
                            />
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 mb-10 lg:mb-0 lg:pl-8">
                        <div className="flex flex-col gap-4 max-w-sm text-center lg:text-left mx-auto">
                            <BlurFade delay={0.25} inView>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                                    {heading}
                                </h2>
                            </BlurFade>
                            <BlurFade delay={0.5} inView>
                                <p className="text-xl md:text-2xl">{text}</p>
                            </BlurFade>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-between pb-10 transition-all duration-500 ease-out lg:flex-row">
                    <div className="w-full lg:w-1/2">
                        <div className="w-full max-w-[300px] mx-auto">
                            <Iphone15Pro className="size-full" src={src} />
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 mb-10 lg:mb-0 lg:pl-8">
                        <div className="flex flex-col gap-4 max-w-sm text-center lg:text-left mx-auto">
                            <BlurFade delay={0.25} inView>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                                    {heading}
                                </h2>
                            </BlurFade>
                            <BlurFade delay={0.5} inView>
                                <p className="text-xl md:text-2xl">{text}</p>
                            </BlurFade>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Features;
