import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studentGradeResponse } from "@/services/grades/get-grade-of-student-in-laboratory.service";

import { GradingForm } from "./GradingForm";

type gradingSidebarProps = {
  laboratoryUUID: string;
  studentUUID: string;
  isLoading: boolean;
  studentGrade: studentGradeResponse;
};

export const GradingSidebar = ({
  laboratoryUUID,
  studentUUID,
  isLoading,
  studentGrade
}: gradingSidebarProps) => {
  // TODO: Use a proper loading component
  if (isLoading) return <aside className="px-4">Loading...</aside>;

  return (
    <aside className="px-4">
      <Tabs defaultValue="grade">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grade">Grade</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="grade">
          <GradingForm
            laboratoryUUID={laboratoryUUID}
            studentUUID={studentUUID}
            studentGrade={studentGrade}
          />
        </TabsContent>
        <TabsContent value="submissions">Pending :D</TabsContent>
      </Tabs>
    </aside>
  );
};
