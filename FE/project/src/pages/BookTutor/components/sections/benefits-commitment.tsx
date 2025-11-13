import React from 'react';
import { CheckCircle, Award, Target, TrendingUp, Shield, Clock } from 'lucide-react';

const BenefitsCommitment = () => {
  const benefits = [
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      title: 'Certificate of Completion',
      description: 'Receive an official certificate upon completing your course'
    },
    {
      icon: <Target className="w-6 h-6 text-green-600" />,
      title: 'Guaranteed Learning Outcomes',
      description: 'Achieve measurable progress or get additional free sessions'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      title: 'Progress Tracking',
      description: 'Regular assessments and detailed progress reports'
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: 'Money-Back Guarantee',
      description: 'Full refund if not satisfied within first 2 sessions'
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: 'Flexible Rescheduling',
      description: 'Free rescheduling up to 24 hours before session'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-teal-600" />,
      title: 'Quality Assurance',
      description: 'All tutors are certified and regularly reviewed'
    }
  ];

  const commitments = [
    {
      level: 'Beginner',
      outcome: 'Basic conversation skills in 4-6 weeks',
      details: 'Able to introduce yourself, order food, ask directions'
    },
    {
      level: 'Intermediate',
      outcome: 'Fluent conversation in 8-12 weeks',
      details: 'Discuss various topics, understand movies/TV shows'
    },
    {
      level: 'Advanced',
      outcome: 'Professional proficiency in 12-16 weeks',
      details: 'Business presentations, academic writing, debates'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span>Your Benefits & Rights</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">{benefit.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border border-blue-100">
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2 text-blue-900">
          <Target className="w-6 h-6" />
          <span>Our Learning Commitment</span>
        </h2>

        <p className="text-gray-700 mb-6">
          We guarantee measurable progress based on your starting level. If you attend all sessions
          and complete assignments but don't reach these outcomes, you'll receive additional free sessions.
        </p>

        <div className="space-y-4">
          {commitments.map((commitment, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border-l-4 border-blue-600"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-600 text-lg">{commitment.level}</span>
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {commitment.outcome}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{commitment.details}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Important Notes</span>
        </h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• All sessions are recorded for quality assurance and your review</li>
          <li>• Materials and resources are included in your booking</li>
          <li>• Cancellation must be done 24 hours in advance for full refund</li>
          <li>• Progress assessments are conducted every 4 sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default BenefitsCommitment;
