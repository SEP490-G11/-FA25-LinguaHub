import { motion } from 'framer-motion';
import { Activity, Award, Zap, Gift } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Trophy } from "lucide-react";

const LearningActivity = () => {
    const activities = [
        {
            id: 1,
            type: 'achievement',
            icon: <Award className="w-5 h-5 text-yellow-500" />,
            title: 'Achievement Unlocked!',
            description: 'You completed 10 lessons in a row',
            time: '2 hours ago',
            color: 'from-yellow-50 to-orange-50',
            borderColor: 'border-yellow-500'
        },
        {
            id: 2,
            type: 'streak',
            icon: <Zap className="w-5 h-5 text-orange-500" />,
            title: 'Streak Milestone',
            description: '12 days learning streak! Keep it up!',
            time: '5 hours ago',
            color: 'from-orange-50 to-red-50',
            borderColor: 'border-orange-500'
        },
        {
            id: 3,
            type: 'reward',
            icon: <Gift className="w-5 h-5 text-purple-500" />,
            title: 'Reward Earned',
            description: 'You earned 50 learning points',
            time: 'Yesterday',
            color: 'from-purple-50 to-pink-50',
            borderColor: 'border-purple-500'
        }
    ];

    const stats = [
        { label: 'Current Streak', value: '12 days', icon: <Zap className="w-6 h-6 text-orange-500" /> },
        { label: 'Total Points', value: '2,450', icon: <Award className="w-6 h-6 text-yellow-500" /> },
        { label: 'Rank', value: 'Gold', icon: <Award className="w-6 h-6 text-yellow-500" /> }
    ];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                                <Activity className="w-8 h-8 text-blue-600" />
                                <span>Recent Activity</span>
                            </h2>

                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <Card className={`p-5 bg-gradient-to-r ${activity.color} border-l-4 ${activity.borderColor} hover:shadow-lg transition-shadow`}>
                                            <div className="flex items-start space-x-4">
                                                <div className="p-3 bg-white rounded-full shadow-md">
                                                    {activity.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 mb-1">{activity.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                                    <span className="text-xs text-gray-500">{activity.time}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                <Award className="w-6 h-6 text-yellow-500" />
                                <span>Your Stats</span>
                            </h2>

                            <div className="space-y-4">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <Card className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                                </div>
                                                <div className="p-3 bg-white rounded-full shadow-md">
                                                    {stat.icon}
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}

                                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg mt-6">
                                    <div className="text-center">
                                        <div className="inline-block p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mb-4">
                                            <Trophy className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">Level Up Soon!</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Complete 3 more lessons to reach Level 5
                                        </p>
                                        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: '75%' }}></div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default LearningActivity;
