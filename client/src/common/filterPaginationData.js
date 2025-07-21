import axios from "axios";

/**
 * Handles combining or initializing paginated blog data.
 *
 * @param {Object} options
 * @param {boolean} options.createNewArray - Whether to reset results or append.
 * @param {Object|null} options.state - Existing pagination state.
 * @param {Array} options.data - Blogs fetched from the latest route.
 * @param {number} options.page - Current page number.
 * @param {string} options.endpoint - Endpoint used to get total document count.
 * @param {Object} options.payload - Optional payload to send with the count request.
 * @returns {Promise<Object>} - Formatted pagination state.
 */
export const handlePaginationData = async ({
  createNewArray = false,
  state = null,
  data = [],
  page = 1,
  endpoint,
  payload = {},
}) => {
  try {
    // If not creating new array, merge with existing results
    if (!createNewArray && state?.results) {
      return {
        ...state,
        results: [...state.results, ...data],
        page,
      };
    }

    // Fetch total number of blogs from the count endpoint
    const response = await axios.post(
      import.meta.env.VITE_SERVER_URL + endpoint,
      payload,
    );

    const totalDocs = response?.data?.totalDocs || 0;

    return {
      results: data,
      totalDocs,
      page: 1,
    };
  } catch (error) {
    console.error("Failed to fetch paginated data:", error);
    return {
      results: [],
      totalDocs: 0,
      page: 1,
      error: "Failed to fetch data",
    };
  }
};
