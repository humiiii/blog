import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import InPageNavigation from "../components/InPageNavigation.component";
import PageAnimation from "../components/page.animation";
import Loader from "../components/Loader.component";
import BlogPost from "../components/BlogPost.component";
import Nodata from "../components/Nodata.component";
import LoadMoreDataButton from "../components/LoadMoreDataButton.component";
import { handlePaginationData } from "../common/filterPaginationData";
import UserCard from "../components/UserCard.component";
import { LuUserRound } from "react-icons/lu";

const Search = () => {
  const { query } = useParams();

  const [latestLoading, setLatestLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const [latestBlogs, setLatestBlogs] = useState({
    results: [],
    page: 1,
    totalDocs: 0,
  });

  const fetchUsers = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/search/search-users`,
        { query },
      );

      if (data.success) {
        setUsers(data.users);
      } else {
        setUsers([]);
        toast.error("No users found");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      toast.error("Failed to fetch users");
    }
  };

  const searchBlogs = async ({ page = 1, reset = false }) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/search/search-blogs`,
        { query, page },
      );

      const formattedData = await handlePaginationData({
        createNewArray: reset,
        state: latestBlogs,
        data: data.blogs,
        page,
        endpoint: "/api/search/search-blogs-count",
        payload: { query },
      });

      setLatestBlogs(formattedData);
    } catch (err) {
      console.error("Error fetching search blogs:", err);
      toast.error("Failed to load search blogs");
    } finally {
      setLatestLoading(false);
      setLoadMoreLoading(false);
    }
  };

  const handleLoadMore = () => {
    setLoadMoreLoading(true);
    searchBlogs({ page: latestBlogs.page + 1 });
  };

  useEffect(() => {
    setLatestLoading(true);
    setLatestBlogs({
      results: [],
      page: 1,
      totalDocs: 0,
    });
    fetchUsers();
    searchBlogs({ page: 1, reset: true });
  }, [query]);

  const UserCardWrapper = () => {
    if (!users) return <Loader />;
    if (users.length === 0) return <Nodata message="No user found" />;

    return (
      <>
        {users.map((user, index) => (
          <PageAnimation
            key={index}
            transition={{ duration: 1, delay: index * 0.1 }}
          >
            <UserCard user={user} />
          </PageAnimation>
        ))}
      </>
    );
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search results for { ${query} }`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {latestLoading ? (
              <Loader size={60} />
            ) : latestBlogs.results.length ? (
              latestBlogs.results.map((blog, index) => (
                <PageAnimation
                  key={index}
                  transition={{ duration: 1, delay: index * 0.1 }}
                >
                  <BlogPost content={blog} author={blog.author.personal_info} />
                </PageAnimation>
              ))
            ) : (
              <Nodata message="No blogs found." />
            )}

            {latestBlogs.results.length < latestBlogs.totalDocs && (
              <LoadMoreDataButton
                onClick={handleLoadMore}
                isVisible={true}
                loading={loadMoreLoading}
              />
            )}
          </>
          <UserCardWrapper />
        </InPageNavigation>
      </div>
      <div className="border-gray max-w-md min-w-[40%] border-l pt-3 pl-8 max-md:hidden lg:min-w-[350px]">
        <h1 className="mb-8 flex items-center gap-4 text-xl">
          User related search <LuUserRound className="text-xl" />
        </h1>
        <UserCardWrapper />
      </div>
    </section>
  );
};

export default Search;
