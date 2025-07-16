import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import PageAnimation from "../components/page.animation";
import InPageNavigation from "../components/InPageNavigation.component";
import Loader from "../components/Loader.component";
import BlogPost from "../components/BlogPost.component";
import MinimalBlogPost from "../components/MinimalBlogPost.component";

const HomePage = () => {
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/blogs/latest`,
        );
        setLatestBlogs(data.blogs || []);
      } catch (err) {
        console.error("Error fetching latest blogs:", err);
        toast.error("Failed to load latest blogs");
      }
    };

    const fetchTrendingBlogs = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/blogs/trending`,
        );
        setTrendingBlogs(data.blogs || []);
      } catch (err) {
        console.error("Error fetching trending blogs:", err);
        toast.error("Failed to load trending blogs");
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchLatestBlogs(), fetchTrendingBlogs()]);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <PageAnimation>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {loading ? (
                <Loader />
              ) : latestBlogs.length ? (
                latestBlogs.map((blog, index) => (
                  <PageAnimation
                    key={index}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <BlogPost
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </PageAnimation>
                ))
              ) : (
                <p className="text-center text-gray-500">No blogs found.</p>
              )}
            </>
            <>
              {loading ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, index) => (
                  <PageAnimation
                    key={index}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <MinimalBlogPost content={blog} index={index} />
                  </PageAnimation>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No trending blogs found.
                </p>
              )}
            </>
          </InPageNavigation>
        </div>
        <div className=""></div>
      </section>
    </PageAnimation>
  );
};

export default HomePage;
