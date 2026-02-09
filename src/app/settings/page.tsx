import { getLCATs, getSkills } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { LCATManager } from "@/components/settings/lcat-manager";
import { SkillManager } from "@/components/settings/skill-manager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  const lcats = getLCATs();
  const skills = getSkills();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        description="Manage labor categories, skills, and other configuration."
      />
      <div className="flex-1 p-6">
        <Tabs defaultValue="lcats" className="w-full">
          <TabsList>
            <TabsTrigger value="lcats">Labor Categories</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>
          <TabsContent value="lcats" className="mt-4">
            <LCATManager initialLcats={lcats} />
          </TabsContent>
          <TabsContent value="skills" className="mt-4">
            <SkillManager initialSkills={skills} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
