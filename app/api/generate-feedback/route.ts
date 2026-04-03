import InterviewFeedbackGenerator from "@/lib/generate-feedback";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const {
    transcript,
    job,
    userId,
    interviewId,
    interviewQs,
    userName,
    resumeData,
    useResumeFallback,
  } = await request.json();

  console.log("=== FEEDBACK GENERATION STARTED ===");
  console.log("User ID:", userId);
  console.log("Interview ID:", interviewId);
  console.log("Transcript length:", transcript?.length || 0);
  console.log("Interview questions count:", interviewQs?.length || 0);

  if (!userId) {
    return Response.json({
      success: false,
      message: "User id is required",
    });
  }

  // Ensure Prisma client is available
  if (!prisma) {
    console.error("Prisma client is not initialized");
    return Response.json({
      success: false,
      message: "Database connection error",
    });
  }

  if (!useResumeFallback && (!transcript || transcript.length === 0 || !job)) {
    return Response.json({
      success: false,
      message: "interview transcript and job data are required",
    });
  }

  try {
    console.log("Checking database connection...");
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("User found:", !!user);

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found",
      });
    }

    let interview;

    if (interviewId) {
      interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          feedbacks: true,
        },
      });

      if (interview) {
        console.log(`✓ Found existing interview: ${interviewId}`);

        if (interview.feedbacks && interview.feedbacks.length > 0) {
          console.log("⚠ Interview already has feedback, returning existing");
          return Response.json({
            success: true,
            interviewId: interview.id,
            message: "Feedback already exists for this interview",
            feedback: interview.feedbacks[0],
          });
        }
      }
    }

    if (!interview) {
      console.log("Creating new interview record...");
      const techstackString = Array.isArray(job.requirements)
        ? job.requirements.join(", ")
        : String(job.requirements || "");

      interview = await prisma.interview.create({
        data: {
          id: interviewId || undefined,
          role: job.title || "",
          level: job.level || "",
          questions: JSON.stringify(interviewQs || []),
          techstack: techstackString,
          type: job.type || "",
          userId: userId,
        },
      });
      console.log(`✓ Created interview: ${interview.id}`);
    }

    let formattedTranscript = "";

    if (useResumeFallback && resumeData) {
      formattedTranscript = `
Resume-Based Assessment for ${userName}

CANDIDATE PROFILE:
- Skills: ${resumeData.skills?.join(", ") || "Not specified"}
- Experience: ${resumeData.experience || "Not specified"}
- Education: ${resumeData.education || "Not specified"}
- Projects: ${resumeData.projects || "Not specified"}
- Achievements: ${resumeData.achievements || "Not specified"}

NOTE: This is a resume-based assessment as the interview was too brief to gather sufficient conversation data.
The feedback below is based on the candidate's resume content and how well it aligns with the ${
        job.level
      } level position.
`;
    } else {
      if (!transcript || transcript.length === 0) {
        console.error("Empty transcript received");
        return Response.json({
          success: false,
          message:
            "No conversation data found. Please conduct a proper interview.",
        });
      }

      formattedTranscript = transcript
        .map(
          (sentence: { role: string; content: string }) =>
            `- ${sentence.role}: ${sentence.content}\n`
        )
        .join("");

      console.log(
        "Formatted transcript preview:",
        formattedTranscript.substring(0, 500)
      );
    }

    console.log("Generating feedback with AI...");

    const generator = new InterviewFeedbackGenerator(
      job as any,
      formattedTranscript,
      interviewQs,
      userName
    );

    const result = (await generator.generateCompleteFeedback()) as any;

    console.log("✓ AI feedback generated successfully");
    console.log("Generated feedback structure:", {
      has_summary: !!result.interview_summary,
      has_scorecard: !!result.scorecard,
      question_count: result.per_question_feedback?.length || 0,
      has_recommendations: !!result.final_recommendations,
    });

    // Validate LLM response
    if (!result || typeof result !== "object") {
      throw new Error("Invalid feedback response from LLM");
    }

    // Extract data from the nested structure
    const interviewSummary = result.interview_summary || {};
    const scorecard = result.scorecard || {};
    const questionFeedbacks = result.per_question_feedback || [];
    const finalRecommendations = result.final_recommendations || {};

    // Validate minimum required data
    if (!interviewSummary.overall_rating) {
      console.warn("Missing overall_rating, using default value");
    }

    // Parse strengths and areas for improvement
    const parseArray = (data: any): string => {
      if (Array.isArray(data)) {
        return data.join("; ");
      }
      if (typeof data === "string") {
        return data;
      }
      return "";
    };

    const notableStrengths = parseArray(interviewSummary.notable_strengths);
    const areasForImprovement = parseArray(
      interviewSummary.areas_for_improvement
    );
    const practiceFocusAreas = parseArray(
      finalRecommendations.practice_focus_areas
    );

    await prisma.$transaction(async (tx: any) => {
      const feedback = await tx.feedback.create({
        data: {
          interviewId: interview.id,
          userId,
          totalScore: parseFloat(String(interviewSummary.overall_rating || 0)),
          strengths: notableStrengths || "",
          areasForImprovement: areasForImprovement || "",
          finalAssessment:
            finalRecommendations.overall_impression ||
            interviewSummary.overall_analysis ||
            "",
        },
      });

      // Create category scores from scorecard
      if (scorecard) {
        const categoryScoresData = [];

        if (scorecard.technical_skills) {
          categoryScoresData.push({
            feedbackId: feedback.id,
            name: "Technical Skills",
            score: parseFloat(String(scorecard.technical_skills.score || 0)),
            comment: scorecard.technical_skills.commentary || "",
          });
        }

        if (scorecard.problem_solving) {
          categoryScoresData.push({
            feedbackId: feedback.id,
            name: "Problem Solving",
            score: parseFloat(String(scorecard.problem_solving.score || 0)),
            comment: scorecard.problem_solving.commentary || "",
          });
        }

        if (scorecard.communication) {
          categoryScoresData.push({
            feedbackId: feedback.id,
            name: "Communication",
            score: parseFloat(String(scorecard.communication.score || 0)),
            comment: scorecard.communication.commentary || "",
          });
        }

        if (scorecard.confidence) {
          categoryScoresData.push({
            feedbackId: feedback.id,
            name: "Confidence",
            score: parseFloat(String(scorecard.confidence.score || 0)),
            comment: scorecard.confidence.commentary || "",
          });
        }

        if (categoryScoresData.length > 0) {
          await tx.categoryScore.createMany({
            data: categoryScoresData,
          });
        }
      }

      // Create detailed feedback
      const detailedFeedback = await tx.detailedFeedback.create({
        data: {
          feedbackId: feedback.id,
          overallAnalysis: interviewSummary.overall_analysis || "",
          notableStrengths: notableStrengths || "",
          areasForImprovement: areasForImprovement || "",
          overallRating: parseFloat(
            String(interviewSummary.overall_rating || 0)
          ),
          technicalSkillsScore: parseInt(
            String(scorecard.technical_skills?.score || 0)
          ),
          technicalSkillsCommentary:
            scorecard.technical_skills?.commentary || "",
          problemSolvingScore: parseInt(
            String(scorecard.problem_solving?.score || 0)
          ),
          problemSolvingCommentary: scorecard.problem_solving?.commentary || "",
          communicationScore: parseInt(
            String(scorecard.communication?.score || 0)
          ),
          communicationCommentary: scorecard.communication?.commentary || "",
          confidenceScore: parseInt(String(scorecard.confidence?.score || 0)),
          confidenceCommentary: scorecard.confidence?.commentary || "",
          practiceFocusAreas: practiceFocusAreas || "",
          overallImpression: finalRecommendations.overall_impression || "",
          finalTip: finalRecommendations.final_tip || "",
        },
      });

      if (questionFeedbacks && Array.isArray(questionFeedbacks)) {
        console.log(
          `Processing ${questionFeedbacks.length} question feedbacks...`
        );

        const questionFeedbackData = questionFeedbacks
          .filter((qf: any) => qf && qf.question)
          .map((qf: any, index: number) => {
            const evaluation = qf.evaluation || {};
            const expectedPoints = Array.isArray(qf.expected_ideal_points)
              ? qf.expected_ideal_points.join("; ")
              : String(qf.expected_ideal_points || "");
            const missedPoints = Array.isArray(evaluation.missed_points)
              ? evaluation.missed_points.join("; ")
              : String(evaluation.missed_points || "");

            const candidateAnswer = qf.candidate_answer || "No answer recorded";

            console.log(
              `Question ${index + 1}: ${qf.question?.substring(0, 50)}...`
            );
            console.log(
              `Answer preview: ${candidateAnswer.substring(0, 100)}...`
            );

            return {
              detailedFeedbackId: detailedFeedback.id,
              questionId: qf.question_id || index + 1,
              question: qf.question || "",
              candidateAnswer: candidateAnswer,
              candidateAnswerSummary: null,
              actualAnswer: qf.actual_answer || null,
              expectedIdealPoints: expectedPoints,
              recommendation: qf.recommendation || "",
              evaluationScore: parseInt(String(evaluation.score || 0)),
              evaluationCoverage: evaluation.coverage || "",
              evaluationMissedPoints: missedPoints,
              evaluationDepth: evaluation.depth || "",
            };
          });

        if (questionFeedbackData.length > 0) {
          await tx.questionFeedback.createMany({
            data: questionFeedbackData,
          });
          console.log(
            `✓ Stored ${questionFeedbackData.length} question feedbacks`
          );
        } else {
          console.warn("No valid question feedbacks to store");
        }
      }

      await tx.interview.update({
        where: { id: interview.id },
        data: {
          finalized: true,
        },
      });

      console.log("✓ Interview marked as finalized");
    });

    console.log("=== FEEDBACK GENERATION COMPLETED SUCCESSFULLY ===");

    return Response.json({
      success: true,
      interviewId: interview.id,
      feedback: result,
      message: "Feedback generated and saved successfully",
    });
  } catch (error) {
    console.error("Error generating/saving feedback:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json(
      {
        success: false,
        message: "Failed to generate or save feedback",
        error:
          process.env.NODE_ENV === "development"
            ? { message: errorMessage, stack: (error as Error).stack }
            : { message: errorMessage },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return Response.json({ message: "All righty !!" });
}
