import Link from "next/link";
import { Employee, LCAT, Skill } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmployeeDetailCardProps {
  employee: Employee;
  lcats: LCAT[];
  skills: Skill[];
}

export function EmployeeDetailCard({ employee, lcats, skills }: EmployeeDetailCardProps) {
  const lcat = lcats.find((l) => l.id === employee.lcatId);
  const employeeSkills = skills.filter((s) => employee.skills.includes(s.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Labor Category
          </div>
          <div className="text-lg">{lcat?.name || "Unknown"}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {employeeSkills.length > 0 ? (
              employeeSkills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No skills listed</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/employees/new?id=${employee.id}`}>
            <Button variant="outline">Edit Employee</Button>
          </Link>
          <Link href="/employees">
            <Button variant="ghost">Back to Roster</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
