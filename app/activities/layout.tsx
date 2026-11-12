import type { ReactNode } from "react";
import { TeacherHeader } from "@/components/ui/teacher-header";

export default function ActivitiesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TeacherHeader />
      {children}
    </>
  );
}
