import { ProfileForm } from './components/sections/profile-form';
import { ProfileHeader } from './components/sections/profile-header';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileForm />
      </div>
    </div>
  );
};

export default Profile;
