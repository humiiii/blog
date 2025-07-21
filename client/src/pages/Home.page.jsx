import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import PageAnimation from "../components/page.animation";
import InPageNavigation, {
  activeTabRef,
} from "../components/InPageNavigation.component";
import Loader from "../components/Loader.component";
import BlogPost from "../components/BlogPost.component";
import MinimalBlogPost from "../components/MinimalBlogPost.component";
import { IoTrendingUp } from "react-icons/io5";
import Nodata from "../components/Nodata.component";
import { handlePaginationData } from "../common/filterPaginationData.js";
import LoadMoreDataButton from "../components/LoadMoreDataButton.component";

const filterWords = [
  "Technology",
  "Travel",
  "Development",
  "Health",
  "Finance",
  "Lifestyle",
  "Eha",
  "Entertainment",
];

const HomePage = () => {
  const [latestBlogs, setLatestBlogs] = useState({
    results: [],
    page: 1,
    totalDocs: 0,
  });
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [pageState, setPageState] = useState("home");

  const fetchLatestBlogs = async (page = 1, reset = false) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/blogs/latest`,
        { page },
      );

      const formatedData = await handlePaginationData({
        createNewArray: reset,
        state: latestBlogs,
        data: data.blogs,
        page,
        endpoint: "/api/blogs/all-latest-blogs-count",
      });

      setLatestBlogs(formatedData);
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

  const fetchBlogsByCategory = async (page = 1, reset = false) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/search/search-blogs`,
        { tag: pageState, page },
      );

      const formatedData = await handlePaginationData({
        createNewArray: reset,
        state: latestBlogs,
        data: data.blogs,
        page,
        endpoint: "/api/search/search-blogs-count",
        payload: { tag: pageState },
      });

      setLatestBlogs(formatedData);
    } catch (err) {
      console.error("Error fetching search blogs:", err);
      toast.error("Failed to load blogs");
    }
  };

  useEffect(() => {
    activeTabRef.current.click();
    const fetch = async () => {
      setLatestLoading(true);
      if (pageState === "home") {
        await fetchLatestBlogs(1, true);
      } else {
        await fetchBlogsByCategory(1, true);
      }
      setLatestLoading(false);
    };
    fetch();
  }, [pageState]);

  useEffect(() => {
    const fetch = async () => {
      setTrendingLoading(true);
      await fetchTrendingBlogs();
      setTrendingLoading(false);
    };
    fetch();
  }, []);

  const handleFilterBlogByCategory = (e) => {
    const filterText = e.target.innerText.toLowerCase();

    if (pageState === filterText) {
      setPageState("home");
    } else {
      setPageState(filterText);
    }

    // Reset state to initial object on category change
    setLatestBlogs({
      results: [],
      page: 1,
      totalDocs: 0,
    });
  };

  const handleLoadMore = async () => {
    setLoadMoreLoading(true);
    const nextPage = latestBlogs.page + 1;

    if (pageState === "home") {
      await fetchLatestBlogs(nextPage);
    } else {
      await fetchBlogsByCategory(nextPage);
    }

    setLoadMoreLoading(false);
  };

  return (
    <PageAnimation>
      <section className="h-cover flex justify-center gap-10">
        {/* LEFT SIDE - MAIN BLOGS LIST */}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
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
                    <BlogPost
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </PageAnimation>
                ))
              ) : (
                <Nodata message="No blogs found." />
              )}

              {/* Load More (for both homepage and category-based search) */}
              {latestBlogs.results.length < latestBlogs.totalDocs && (
                <LoadMoreDataButton
                  onClick={handleLoadMore}
                  isVisible={true}
                  loading={loadMoreLoading}
                />
              )}
            </>
            <>
              {trendingLoading ? (
                <Loader size={60} />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, index) => (
                  <PageAnimation
                    key={index}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <MinimalBlogPost blog={blog} index={index} />
                  </PageAnimation>
                ))
              ) : (
                <Nodata message="No trending blogs found." />
              )}
            </>
          </InPageNavigation>
        </div>

        {/* RIGHT SIDE - CATEGORIES + TRENDING */}
        <div className="border-gray max-w-min min-w-[40%] border-l pt-3 pl-8 max-md:hidden lg:min-w-[400px]">
          <div className="flex flex-col gap-10">
            {/* CATEGORY FILTER */}
            <div>
              <h1 className="mb-8 text-xl font-medium">
                Stories from all interests
              </h1>
              <div className="flex flex-wrap gap-3">
                {filterWords.map((word, index) => (
                  <button
                    onClick={handleFilterBlogByCategory}
                    key={index}
                    className={`tag ${pageState === word.toLowerCase() ? "bg-black text-white" : ""}`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* TRENDING BLOGS */}
            <div>
              <h1 className="mb-8 flex items-center gap-4 text-xl font-medium">
                Trending <IoTrendingUp />
              </h1>
              {trendingLoading ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, index) => (
                  <PageAnimation
                    key={index}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  >
                    <MinimalBlogPost blog={blog} index={index} />
                  </PageAnimation>
                ))
              ) : (
                <Nodata message="No trending blogs found." />
              )}
            </div>
          </div>
        </div>
      </section>
    </PageAnimation>
  );
};

export default HomePage;
