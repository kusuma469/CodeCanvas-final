// File: toolbar/index.tsx
"use client";

import dynamic from "next/dynamic";
import { ToolbarSkeleton } from "./toolbar-skeleton";

const Toolbar = dynamic(() => import("./toolbar"), {
  ssr: false,
  loading: () => <ToolbarSkeleton />,
});

export default Toolbar;

