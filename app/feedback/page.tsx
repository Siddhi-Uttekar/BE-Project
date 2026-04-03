import { FeedbackForm } from "@/components/feedback-form";

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
      <div className="container mx-auto py-12 md:py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent sm:text-5xl lg:text-6xl mb-6">
              Share Your Feedback
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Your insights are valuable to us. Please let us know about your
              interview experience and help us improve our process.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-100 p-6 md:p-10 lg:p-12">
            <FeedbackForm />
          </div>
        </div>
      </div>
    </div>
  );
}
