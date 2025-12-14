import {
  Home,
  Settings,
  AudioWaveform,
  GalleryVerticalEnd,
  LucideIcon,
} from "lucide-react";

export interface SubNavItem {
  title: string;
  url: string;
  translationKey: string;
}

export interface MainNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: SubNavItem[];
  translationKey: string;
}

export interface SecondaryNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  translationKey: string;
}

export interface NavigationData {
  navMain: MainNavItem[];
  navSecondary: SecondaryNavItem[];
}

export const navigationData: NavigationData = {
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: Home,
      isActive: true,
      items: [],
      translationKey: "home",
    },
    {
      title: "Transcribe",
      url: "/transcribe",
      icon: AudioWaveform,
      isActive: true,
      items: [],
      translationKey: "transcribe",
    },
    {
      title: "Recordings",
      url: "/recordings",
      icon: GalleryVerticalEnd,
      isActive: true,
      items: [],
      translationKey: "recordings",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      translationKey: "settings",
    },
  ],
};
