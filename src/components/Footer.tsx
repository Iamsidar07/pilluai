import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

const Footer = () => {
  const SOCIALS = [
    {
      href: "https://github.com/iamsidar07",
      lable: "Github",
    },
    {
      href: "https://linkedin.com/in/iamsidar",
      lable: "Linkedin",
    },
    {
      href: "https://twitter.com/iamsidar07",
      lable: "Twitter",
    },
  ];

  const LEGAL = [
    {
      href: "/privacy",
      lable: "Privacy",
    },
    {
      href: "/terms",
      lable: "Terms",
    },
  ];

  return (
    <div className="w-full py-12 lg:py-24 bg-white/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-5 lg:gap-8 ">
          <div className="w-full space-y-8 lg:col-span-2">
            <div className="text-gray-500 text-sm flex items-center gap-1 ">
              <Image
                src="/logo.png"
                width={30}
                height={30}
                alt="logo"
                className="object-contain"
              />
              Pillu AI
            </div>
            <p className="text-gray-500 text-sm leading-6 pl-2">
              If you&apos;re a developer, video editor, researcher, or anyone
              who works with their brain, PilluAI can help you think 10x faster,
              boosting your productivity and helping you make 10x more money.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 lg:col-span-3 lg:mt-0">
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-sm">Socials</h3>
              {SOCIALS.map((social, index) => (
                <Link
                  key={social.href}
                  href={social.href}
                  className="text-gray-600 text-sm"
                  target="_blank"
                >
                  {social.lable}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-sm">Legals</h3>
              {LEGAL.map((social, index) => (
                <Link
                  key={social.href}
                  href={social.href}
                  className="text-gray-600 text-sm"
                >
                  {social.lable}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 lg:mt-16 border-t border-gray-200 py-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Pillu AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
