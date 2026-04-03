import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Scorecard } from "@/types/feedback";

interface ScorecardSectionProps {
  scorecard: Scorecard;
  getScoreValue: (score: number) => number;
  scoreColor: (score: number) => string;
}

const formatSkillName = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ScorecardSection: React.FC<ScorecardSectionProps> = ({
  scorecard,
  getScoreValue,
  scoreColor,
}) => {
  return (
    <Card className="mb-6 overflow-hidden shadow-md border-emerald-100">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 p-6">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          Skills Scorecard
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-5">
          {Object.entries(scorecard).map(
            ([skill, { score, commentary }], index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">
                    {formatSkillName(skill)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-sm py-1 px-3 rounded-lg font-bold shadow-sm">
                      {score}/10
                    </span>
                  </div>
                </div>

                <Progress
                  value={getScoreValue(score)}
                  className={`h-2 ${scoreColor(score)}`}
                />

                <p className="text-sm text-gray-600 leading-relaxed">
                  {commentary}
                </p>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScorecardSection;
