import type { ReactNode } from "react";
import { TeacherHeader } from "@/components/ui/teacher-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TeacherHeader />
      {children}
    </>
  );
}
