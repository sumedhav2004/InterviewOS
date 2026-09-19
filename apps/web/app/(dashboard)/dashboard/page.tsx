"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { userApi } from "@/lib/api";
import { Container, Page, Stack } from "@/components/layout";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export default function Dashboard() {
  return <DashboardPage />
}