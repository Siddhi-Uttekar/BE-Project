import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinalRecommendations as FinalRecommendationsType } from "@/types/feedback";
import { Star, Target, TrendingUp } from "lucide-react";

interface FinalRecommendationsProps {
  recommendations: FinalRecommendationsType;
}

const FinalRecommendations: React.FC<FinalRecommendationsProps> = ({
  recommendations,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-emerald-100 shadow-md">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <CardTitle className="flex items-center font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            <Target className="w-5 h-5 mr-2 text-emerald-600" />
            Practice Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            {recommendations.practice_focus_areas?.length > 0 ? (
              recommendations.practice_focus_areas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-3 mt-0.5 flex-shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {area}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No specific focus areas identified
              </p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Overall Impression & Final Tip */}
      <div className="space-y-6">
        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="flex items-center font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <Star className="w-5 h-5 mr-2 text-blue-600" />
              Overall Impression
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed">
              {recommendations.overall_impression}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 via-green-50 to-blue-50 border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
              Pro Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-emerald-800 font-semibold leading-relaxed">
              {recommendations.final_tip}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinalRecommendations;
