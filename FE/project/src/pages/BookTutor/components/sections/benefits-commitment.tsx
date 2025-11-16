import {
  CheckCircle,
  Target,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

const BenefitsCommitment = () => {
  const benefits = [

    {
      icon: <Target className="w-6 h-6 text-green-600" />,
      title: "Guaranteed Learning Outcomes",
      description: "Make measurable progress or get free additional sessions.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      title: "Progress Tracking",
      description: "Regular assessments and full progress reports after each stage.",
    },

    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "Flexible Rescheduling",
      description: "Reschedule for free up to 24 hours before the session.",
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-teal-600" />,
      title: "Quality Assurance",
      description: "All tutors are certified and continuously evaluated.",
    },
  ];

  const commitments = [
    {
      level: "Beginner",
      outcome: "Simple conversations within 4–6 weeks",
      details: "Introduce yourself, order food, ask directions, basic speaking fluency.",
    },
    {
      level: "Intermediate",
      outcome: "Comfortable daily conversations in 8–12 weeks",
      details: "Discuss general topics, understand TV shows, express personal opinions.",
    },
    {
      level: "Advanced",
      outcome: "Professional English in 12–16 weeks",
      details: "Presentations, debate skills, academic writing, business communication.",
    },
  ];

  return (
      <div className="space-y-6">

        {/* BENEFITS SECTION */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span>Your Benefits & Rights</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
                <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg
              hover:bg-white hover:shadow transition-all duration-200 border"
                >
                  <div className="mt-1">{benefit.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* COMMITMENT SECTION */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md p-6 border border-blue-100">
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2 text-blue-900">
            <Target className="w-6 h-6" />
            <span>Our Learning Commitment</span>
          </h2>

          <p className="text-gray-700 mb-6 leading-relaxed">
            We guarantee your progress with consistent practice. If you attend all sessions and complete the assignments but still need improvement, we offer additional support sessions at no extra cost.
          </p>

          <div className="space-y-4">
            {commitments.map((item, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg p-4 border-l-4 border-blue-600 shadow-sm hover:shadow transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-700 text-lg">{item.level}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {item.outcome}
                </span>
                  </div>
                  <p className="text-gray-600 text-sm">{item.details}</p>
                </div>
            ))}
          </div>
        </div>

        {/* IMPORTANT NOTES */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>Important Notes</span>
          </h3>

          <ul className="text-sm text-yellow-800 space-y-1">
            {/*<li>• All sessions are recorded for quality assurance and your review.</li>*/}
            <li>• All learning materials are included with your booking.</li>
            <li>• Booked sessions are final and cannot be cancelled or refunded.</li>
            <li>• Progress evaluations are carried out throughout the learning process.</li>
          </ul>
        </div>

      </div>
  );
};

export default BenefitsCommitment;
