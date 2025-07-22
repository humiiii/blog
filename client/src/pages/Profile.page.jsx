import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

import { UserContext } from "../App";
import PageAnimation from "../components/page.animation";
import Loader from "../components/Loader.component";
import AboutUser from "../components/AboutUser.component";
import { handlePaginationData } from "../common/filterPaginationData";
import InPageNavigation from "../components/InPageNavigation.component";
import BlogPost from "../components/BlogPost.component";
import LoadMoreDataButton from "../components/LoadMoreDataButton.component";
import Nodata from "../components/Nodata.component";
import PageNotFound from "./404.page";

// Initial structure for profile state
export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

const Profile = () => {
  const { id: profileUsername } = useParams();
  const { userAuth } = useContext(UserContext);

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(false);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [userBlogs, setUserBlogs] = useState({
    results: [],
    page: 1,
    totalDocs: 0,
    user_id: null,
  });

  const {
    personal_info: { fullname, username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const isOwnProfile =
    userAuth?.user?.username?.toLowerCase() === profileUsername?.toLowerCase();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/user/get-profile`,
          { username: profileUsername },
        );

        if (data.success && data.user) {
          // Fetch blogs for the user after loading user profile
          fetchUserBlogs({ page: 1, reset: true, user_id: data.user._id });
          setProfile(data.user);
          setNotFound(false);
        } else {
          setNotFound(true);
          toast.error(data.error || "Failed to fetch profile.");
        }
      } catch (err) {
        setNotFound(true);
        console.error("Error fetching profile:", err);
        toast.error("Something went wrong while loading the profile.");
      } finally {
        setLoading(false);
      }
    };

    if (profileUsername) {
      fetchUserProfile();
    }
  }, [profileUsername]);

  // Fetch paginated user blogs
  const fetchUserBlogs = async ({ page = 1, reset = false, user_id }) => {
    try {
      if (reset) setBlogsLoading(true);

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/search/search-blogs`,
        { author: user_id, page },
      );

      const formatedData = await handlePaginationData({
        createNewArray: reset,
        state: userBlogs,
        data: data.blogs,
        page,
        endpoint: "/api/search/search-blogs-count",
        payload: { author: user_id },
      });

      formatedData.user_id = user_id;
      setUserBlogs(formatedData);
    } catch (err) {
      console.error("Error fetching user blogs:", err);
      toast.error("Failed to load blogs");
    } finally {
      if (reset) setBlogsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadMoreLoading(true);

    await fetchUserBlogs({
      page: userBlogs.page + 1,
      user_id: userBlogs.user_id,
    });

    setLoadMoreLoading(false);
  };

  if (notFound) {
    return <PageNotFound />;
  }

  if (loading) {
    return (
      <PageAnimation>
        <Loader />
      </PageAnimation>
    );
  }

  return (
    <PageAnimation>
      <section className="h-cover flex-row-reverse items-start gap-5 min-[1100px]:gap-12 md:flex">
        {/* Left Section — Profile Info and Sidebar */}
        <div className="border-gray flex min-w-[250px] flex-col gap-5 max-md:items-center md:sticky md:top-[100px] md:w-[50%] md:border-l md:py-10 md:pl-8">
          <img
            src={profile_img}
            alt={`${username}'s profile`}
            className="bg-gray h-48 w-48 rounded-lg md:h-32 md:w-32"
          />
          <h1 className="text-2xl font-medium">@{username}</h1>
          <p className="h-6 text-xl capitalize">{fullname}</p>
          <p>
            {total_posts} Blogs - {total_reads} Reads
          </p>

          {isOwnProfile && (
            <div className="mt-2">
              <Link
                className="btn-light rounded-lg"
                to="/settings/edit-profile"
              >
                Edit Profile
              </Link>
            </div>
          )}

          <AboutUser
            className="max-md:hidden"
            bio={bio}
            social_links={social_links}
            joinedAt={joinedAt}
          />
        </div>

        {/* Right Section — Blog Feed */}
        <div className="w-full max-md:mt-12">
          <InPageNavigation
            routes={["Blogs Published", "About"]}
            defaultHidden={["About"]}
          >
            <>
              {blogsLoading ? (
                <Loader size={60} />
              ) : userBlogs.results.length ? (
                userBlogs.results.map((blog, index) => (
                  <PageAnimation
                    key={index}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <BlogPost
                      content={blog}
                      author={blog.author?.personal_info}
                    />
                  </PageAnimation>
                ))
              ) : (
                <Nodata message="No blogs found." />
              )}

              {/* Load More Button */}
              {userBlogs.results.length < userBlogs.totalDocs && (
                <LoadMoreDataButton
                  onClick={handleLoadMore}
                  isVisible={true}
                  loading={loadMoreLoading}
                />
              )}
            </>
            <AboutUser
              bio={bio}
              joinedAt={joinedAt}
              social_links={social_links}
            />
          </InPageNavigation>
        </div>
      </section>
    </PageAnimation>
  );
};

export default Profile;
