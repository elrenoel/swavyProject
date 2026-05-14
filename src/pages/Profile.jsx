import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileSection from "../components/sections/ProfileSection";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!username && user?.user_metadata?.username) {
      navigate(`/profile/${user.user_metadata.username}`, { replace: true });
    }
  }, [navigate, user, username]);

  return <ProfileSection username={username} />;
};

export default Profile;
