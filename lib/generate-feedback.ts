import { client } from "@/lib/openai.sdk";
import { InterviewFeedbackResult, LLMResponse } from "@/types/feedback";
import { Job } from "@/types/feedback";

interface Transcript {
  role: string;
  content: string;
}

class InterviewFeedbackGenerator {
  private jobDetails: Job;
  private transcript: String;
  private questions: string[];
  private userName: string;

  constructor(
    jobDetails: Job,
    transcript: String,
    questions: string[],
    userName: string
  ) {
    this.jobDetails = jobDetails;
    this.transcript = transcript;
    this.questions = questions;
    this.userName = userName;
  }

  async generateInterviewSummary() {
    const prompt = `
    As a senior interview coach, analyze this candidate's overall performance:

    Job Data:
    Position: ${this.jobDetails.title} at ${
      this.jobDetails.company || "the company"
    }
    Employment Type: ${this.jobDetails.type || "N/A"}
    Experience Level: ${this.jobDetails.level}
    Industry: ${this.jobDetails.industry || "N/A"}
    Role Description: ${this.jobDetails.description || "N/A"}

    Candidate's Name: ${this.userName}

    KEY REQUIREMENTS:
    ${
      (this.jobDetails.requirements || [])
        .map((item) => `- ${item}`)
        .join("\n") || "Not specified"
    }

    Focus on:
    - Overall impression and themes
    - Observable strengths across all answers
    - Areas needing improvement
    - Overall rating (0-10)

    Analyze their overall performance, noting:
    - How they came across as a candidate
    - Consistent themes and patterns
    - Observable strengths across answers
    - Areas where coaching would help
    - Overall readiness for this specific role

    Interview transcript or conversation:
    ${this.transcript}

    Return only JSON:
    {
      "overall_analysis": "string",
      "notable_strengths": ["array of strings"],
      "areas_for_improvement": ["array of strings"],
      "overall_rating": "float (0.0 to 10.0)"
    }`;

    return await this.callLLM(prompt);
  }

  async generateScorecard() {
    const prompt = `
   As a senior interview coach, evaluate this candidate's or user performance across key dimensions for this job post:
    Position: ${this.jobDetails.title} at ${
      this.jobDetails.company || "the company"
    }
    Employment Type: ${this.jobDetails.type || "N/A"}
    Experience Level: ${this.jobDetails.level}
    Industry: ${this.jobDetails.industry || "N/A"}
    Role Description: ${this.jobDetails.description || "N/A"}

    Candidate's Name: ${this.userName}

    KEY REQUIREMENTS:
    ${(this.jobDetails.requirements || [])
      .map((item: string) => `- ${item}`)
      .join("\n")}

    MAIN RESPONSIBILITIES:
    ${(this.jobDetails.responsibilities || [])
      .map((item: string) => `- ${item}`)
      .join("\n")}

    Transcript:
    ${this.transcript}

    Score each area 0-10 with detailed specific commentary and give the responsse as you are directly helping or talking to user or candidate:

    Return only JSON:
    {
      "technical_skills": {"score": number, "commentary": "string"},
      "problem_solving": {"score": number, "commentary": "string"},
      "communication": {"score": number, "commentary": "string"},
      "confidence": {"score": number, "commentary": "string"}
    }`;

    return await this.callLLM(prompt);
  }

  async generateQuestionFeedback() {
    const questionFeedback = [];

    console.log(
      `Starting question-by-question feedback generation for ${this.questions.length} questions`
    );

    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];
      console.log(
        `Processing question ${i + 1}/${
          this.questions.length
        }: ${question.substring(0, 60)}...`
      );

      const candidateAnswer = await this.extractAnswerForQuestion(question, i);
      console.log(
        `Extracted answer length: ${candidateAnswer.length} characters`
      );

      const sanitizedQuestion = question.replace(/"/g, '\\"');
      const sanitizedAnswer = candidateAnswer.replace(/"/g, '\\"');

      const prompt = `
As an interview coach, evaluate this single Q&A for this job post:

Position: ${this.jobDetails.title} at ${
        this.jobDetails.company || "the company"
      }
Employment Type: ${this.jobDetails.type || "N/A"}
Experience Level: ${this.jobDetails.level}
Industry: ${this.jobDetails.industry || "N/A"}
Role Description: ${this.jobDetails.description || "N/A"}

Candidate's Name: ${this.userName}

Question: ${question}

Candidate Answer: ${candidateAnswer}

Job Requirements:
${(this.jobDetails.requirements || [])
  .map((item: string) => `- ${item}`)
  .join("\n")}

Your task is to provide detailed feedback:
1. Provide an ideal answer for this specific question and role
2. Identify key points a strong candidate should mention
3. Evaluate how well their answer matched expectations
4. Note specific missed opportunities
5. Assess depth and insight demonstrated
6. Give personal coaching recommendation

Return ONLY this JSON object:
{
  "question_id": ${i + 1},
  "question": "${sanitizedQuestion}",
  "candidate_answer": "${sanitizedAnswer}",
  "actual_answer": "ideal response for this role",
  "expected_ideal_points": ["key point 1", "key point 2", "key point 3"],
  "evaluation": {
    "score": 7,
    "coverage": "coverage analysis",
    "missed_points": ["missed point 1", "missed point 2"],
    "depth": "depth evaluation"
  },
  "recommendation": "coaching suggestion"
}`;

      try {
        const feedback = await this.callLLM(prompt);
        const finalFeedback = Array.isArray(feedback) ? feedback[0] : feedback;

        if (finalFeedback && finalFeedback.question) {
          questionFeedback.push(finalFeedback);
          console.log(`✓ Question ${i + 1} feedback generated successfully`);
        } else {
          console.warn(`⚠ Question ${i + 1} feedback invalid, using fallback`);
          questionFeedback.push({
            question_id: i + 1,
            question: question,
            candidate_answer: candidateAnswer,
            actual_answer: "Unable to generate ideal answer",
            expected_ideal_points: ["Unable to generate"],
            evaluation: {
              score: 5,
              coverage: "Unable to evaluate",
              missed_points: [],
              depth: "Unable to evaluate",
            },
            recommendation: "Please review the full interview transcript",
          });
        }
      } catch (error) {
        console.error(
          `Error generating feedback for question ${i + 1}:`,
          error
        );
        questionFeedback.push({
          question_id: i + 1,
          question: question,
          candidate_answer: candidateAnswer,
          actual_answer: "Error generating feedback",
          expected_ideal_points: ["Error"],
          evaluation: {
            score: 0,
            coverage: "Error",
            missed_points: [],
            depth: "Error",
          },
          recommendation: "Please try again",
        });
      }
    }

    console.log(
      `✓ Completed all ${questionFeedback.length} question feedbacks`
    );
    return questionFeedback;
  }

  async generateFinalRecommendations() {
    const prompt = `
    As a senior interview coach, provide final recommendations based on this candidate's interview performance:

    JOB: ${this.jobDetails.title} at ${this.jobDetails.company || "the company"}
    INDUSTRY: ${this.jobDetails.industry || "N/A"}
    LEVEL: ${this.jobDetails.level}
    Role Description: ${this.jobDetails.description || "N/A"}

    Candidate's Name: ${this.userName}

    KEY REQUIREMENTS:
    ${(this.jobDetails.requirements || [])
      .map((item: string) => `- ${item}`)
      .join("\n")}

    MAIN RESPONSIBILITIES:
    ${(this.jobDetails.responsibilities || [])
      .map((item: string) => `- ${item}`)
      .join("\n")}

    INTERVIEW TRANSCRIPT OR CONVERSATION:
    ${this.transcript}

    Based on what you observed, provide:
    1. Specific practice areas they should focus on before their real interview
    2. Your honest assessment of their readiness for this role
    3. One actionable tip that would make the biggest difference

    Be encouraging but honest - like a mentor who truly wants them to succeed.

    Return ONLY this JSON structure:
    {
      "practice_focus_areas": ["Specific practice area 1", "Specific practice area 2", "Specific practice area 3"],
      "overall_impression": "Your honest take on whether they seem ready for this role and what's missing if not",
      "final_tip": "One encouraging but actionable takeaway that would make a real difference"
    }`;
    return await this.callLLM(prompt);
  }

  async generateCompleteFeedback(): Promise<InterviewFeedbackResult> {
    try {
      const [summary, scorecard, questionFeedback, recommendations] =
        await Promise.all([
          this.generateInterviewSummary(),
          this.generateScorecard(),
          this.generateQuestionFeedback(),
          this.generateFinalRecommendations(),
        ]);

      const completeFeedback = {
        interview_summary: summary,
        scorecard: scorecard,
        per_question_feedback: questionFeedback,
        final_recommendations: recommendations,
      };

      return completeFeedback;
    } catch (error) {
      console.error("Error generating feedback:", error);
      throw new Error("Failed to generate complete feedback");
    }
  }

  async extractAnswerForQuestion(
    question: string,
    index: number
  ): Promise<string> {
    try {
      const transcriptLines = this.transcript
        .split("\n")
        .filter((line) => line.trim());

      let candidateResponse = "";
      let foundQuestion = false;

      for (let i = 0; i < transcriptLines.length; i++) {
        const line = transcriptLines[i];

        if (
          line.toLowerCase().includes(question.toLowerCase().substring(0, 30))
        ) {
          foundQuestion = true;
          continue;
        }

        if (
          foundQuestion &&
          (line.includes("- user:") || line.includes("- assistant:"))
        ) {
          if (line.includes("- user:")) {
            candidateResponse = line.replace(/- user:/i, "").trim();

            for (let j = i + 1; j < transcriptLines.length; j++) {
              const nextLine = transcriptLines[j];
              if (
                nextLine.includes("- assistant:") ||
                nextLine.includes("- user:")
              ) {
                break;
              }
              candidateResponse += " " + nextLine.trim();
            }
            break;
          }
        }
      }

      if (!candidateResponse || candidateResponse.length < 5) {
        console.log(`Using AI extraction for question ${index + 1}`);

        const prompt = `
You are an expert assistant analyzing interview transcripts.

Interview Transcript:
${this.transcript}

Question Asked:
"${question}"

Extract ONLY the candidate's complete answer to this specific question. Return the exact words spoken by the candidate (user role).

Return JSON format:
{
  "exact_answer": "the candidate's complete answer here"
}

If no answer is found, return:
{
  "exact_answer": "No answer was provided by the candidate for this question."
}
`;

        const response: LLMResponse = await this.callLLM(prompt);
        candidateResponse = response?.exact_answer || "No answer recorded";
      }

      return candidateResponse;
    } catch (error) {
      console.error(
        `Error extracting answer for question ${index + 1}:`,
        error
      );
      return "Error extracting answer";
    }
  }

  async callLLM(prompt: string): Promise<any> {
    let text = "";
    try {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          maxOutputTokens: 8192, // Increase max tokens to prevent truncation
          temperature: 0.7,
        },
      });
      const result = await model.generateContent(prompt);
      text = result.response.text();

      // Remove markdown code blocks if present
      text = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      // Fix truncated JSON by ensuring it ends properly
      if (!text.endsWith("}") && !text.endsWith("]")) {
        console.warn("JSON appears truncated, attempting to repair...");

        // Count opening and closing braces
        const openBraces = (text.match(/{/g) || []).length;
        const closeBraces = (text.match(/}/g) || []).length;

        // Find the last complete string value
        let lastQuote = text.lastIndexOf('"');

        // Check if we're in the middle of a string (odd number of quotes after last complete property)
        const textUpToLastQuote = text.substring(0, lastQuote + 1);
        const quotesInLastSegment = (textUpToLastQuote.match(/"/g) || [])
          .length;

        if (quotesInLastSegment % 2 === 0) {
          // Even quotes means string is complete, just add closing braces
          text = textUpToLastQuote;
        } else {
          // Odd quotes means we're in the middle of a string, close it
          const secondLastQuote = text.lastIndexOf('"', lastQuote - 1);
          text = text.substring(0, secondLastQuote + 1);
        }

        // Add necessary closing braces
        const bracesToAdd = openBraces - closeBraces;
        for (let i = 0; i < bracesToAdd; i++) {
          text += "\n}";
        }
      }

      // Sanitize the JSON string to handle control characters within string values
      // This regex-based approach preserves JSON structure while cleaning string content
      text = text.replace(/"([^"\\]|\\.)*"/g, (match) => {
        // Inside a JSON string, escape unescaped control characters
        return match.replace(/[\x00-\x1F]/g, (char) => {
          const code = char.charCodeAt(0);
          if (code === 0x09) return "\\t"; // tab
          if (code === 0x0a) return "\\n"; // newline
          if (code === 0x0d) return "\\r"; // carriage return
          if (code === 0x08) return "\\b"; // backspace
          if (code === 0x0c) return "\\f"; // form feed
          return ""; // Remove other control characters
        });
      });

      const parsedFeedback = JSON.parse(text || "{}");
      return parsedFeedback;
    } catch (error) {
      console.error("Got error while talking to Gemini LLM", error);
      console.error("Failed to parse text:", text?.substring(0, 500));
      console.error("Text length:", text?.length);
      throw error;
    }
  }
}

export default InterviewFeedbackGenerator;
