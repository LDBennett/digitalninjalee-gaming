"use client";

import { NavigationMobileHeader } from "./Navigation.MobileHeader";
import { NavigationDesktopRail } from "./Navigation.DesktopRail";
import { NavigationMobileBottomBar } from "./Navigation.MobileBottomBar";

export function Navigation() {
  return (
    <>
      <NavigationMobileHeader />
      <NavigationDesktopRail />
      <NavigationMobileBottomBar />
    </>
  );
}
