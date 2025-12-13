"use client";

import { useState, useEffect, useMemo } from "react";
import { Download, Github } from "lucide-react";
import { fetchLatestGithubVersion } from "@workspace/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";

const url = "https://github.com/odest/katip/releases/download";
type OSType = "windows" | "linux" | "macos" | "android";

const OS_INFO: Record<OSType, { name: string; icon: string }> = {
  windows: { name: "Download for Windows", icon: "fa-windows" },
  linux: { name: "Download for Linux", icon: "fa-linux" },
  macos: { name: "Download for macOS", icon: "fa-apple" },
  android: { name: "Download for Android", icon: "fa-android" },
};

const detectOS = (): OSType => {
  if (typeof navigator === "undefined") return "windows";
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("android")) return "android";
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("linux")) return "linux";
  return "windows";
};

const createDownloadOptions = (tag: string) => {
  const version = `v${tag}`;
  return {
    windows: [
      {
        url: `${url}/${version}/katip_v${tag}_windows_x64.msi`,
        name: "Installer (.msi)",
      },
      {
        url: `${url}/${version}/katip_v${tag}_windows_x64.exe`,
        name: "Installer (.exe)",
      },
    ],
    linux: [
      {
        url: `${url}/${version}/katip_v${tag}_linux_amd64.AppImage`,
        name: "Portable (AppImage)",
      },
      {
        url: `${url}/${version}/katip_v${tag}_linux_amd64.deb`,
        name: "Debian/Ubuntu (.deb)",
      },
      {
        url: `${url}/${version}/katip_v${tag}_linux_x86_64.rpm`,
        name: "Fedora/RHEL (.rpm)",
      },
    ],
    macos: [
      {
        url: `${url}/${version}/katip_v${tag}_darwin_aarch64.dmg`,
        name: "Apple Silicon (M1/M2/M3)",
      },
      {
        url: `${url}/${version}/katip_v${tag}_darwin_x64.dmg`,
        name: "Intel Mac",
      },
    ],
    android: [
      {
        url: `${url}/${version}/katip_v${tag}_android_universal.apk`,
        name: "Universal (Recommended)",
      },
      {
        url: `${url}/${version}/katip_v${tag}_android_arm64.apk`,
        name: "ARM64 (Most phones)",
      },
      {
        url: `${url}/${version}/katip_v${tag}_android_arm.apk`,
        name: "ARM (Older phones)",
      },
    ],
  };
};

export const DownloadOptions = () => {
  const [currentOS, setCurrentOS] = useState<OSType>("windows");
  const [latestTag, setLatestTag] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestGithubVersion().then((tag) => {
      if (tag) setLatestTag(tag);
    });
  }, []);

  useEffect(() => {
    setCurrentOS(detectOS());
  }, []);

  const downloadOptions = useMemo(
    () => (latestTag ? createDownloadOptions(latestTag) : null),
    [latestTag]
  );

  const osInfo = OS_INFO[currentOS];
  const options = downloadOptions?.[currentOS] ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className="flex items-center gap-3 px-4 py-5 text-lg cursor-pointer"
        >
          <i className={`fab ${osInfo.icon} w-5 h-5`}></i>
          <span>{osInfo.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-card">
        {options.map((option, index) => (
          <DropdownMenuItem
            key={index}
            className="cursor-pointer"
            onClick={() =>
              window.open(option.url, "_blank", "noopener,noreferrer")
            }
          >
            <Download />
            <span>{option.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() =>
            window.open(
              "https://github.com/odest/katip/releases",
              "_blank",
              "noopener,noreferrer"
            )
          }
        >
          <Github />
          <span>View All Versions & Platforms</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
