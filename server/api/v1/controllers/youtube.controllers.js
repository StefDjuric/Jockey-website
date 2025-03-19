import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const searchYoutube = asyncHandler(async (request, response) => {
    try {
        const { q } = request.query;

        if (!q) {
            throw new ApiError(404, "Search query is required.");
        }

        const searchURL = new URL(
            "https://www.googleapis.com/youtube/v3/search"
        );
        searchURL.searchParams.append("part", "snippet");
        searchURL.searchParams.append("maxResults", "10");
        searchURL.searchParams.append("q", q);
        searchURL.searchParams.append("type", "video");
        searchURL.searchParams.append("videoCategoryId", "10");
        searchURL.searchParams.append("key", process.env.YT_API_KEY);

        const searchResponse = await fetch(searchURL.toString());
        const searchData = await searchResponse.json();

        if (!searchData.items || !Array.isArray(searchData.items)) {
            throw new ApiError(500, "Invalid response from YouTube API");
        }

        // Get duration for each video
        const videoIds = searchData.items
            .map((item) => item.id.videoId)
            .join(",");

        if (!videoIds) {
            return response
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { success: true, items: [] },
                        "No videos found."
                    )
                );
        }
        const videoDetailsURL = new URL(
            "https://www.googleapis.com/youtube/v3/videos"
        );
        videoDetailsURL.searchParams.append("part", "contentDetails,snippet");
        videoDetailsURL.searchParams.append("id", videoIds);
        videoDetailsURL.searchParams.append("key", process.env.YT_API_KEY);

        const videoDetailsResponse = await fetch(videoDetailsURL.toString());
        const videoDetailsData = await videoDetailsResponse.json();

        const items = searchData.items.map((item) => {
            const videoDetails = videoDetailsData.items.find(
                (videoItem) => videoItem.id === item.id.videoId
            );

            const duration = videoDetails
                ? parseDuration(videoDetails.contentDetails.duration)
                : 0;

            return {
                id: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnailUrl: item.snippet.thumbnails.medium.url,
                duration: formatDuration(duration),
            };
        });

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true, items: items },
                    "Successfully searched youtube."
                )
            );
    } catch (error) {
        console.error(error);
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error?.message));
    }
});

function parseDuration(isoDuration) {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    const hours = (match?.[1] || "").replace("H", "");
    const minutes = (match?.[2] || "").replace("M", "");
    const seconds = (match?.[3] || "").replace("S", "");

    return (
        (parseInt(hours) || 0) * 3600 +
        (parseInt(minutes) || 0) * 60 +
        (parseInt(seconds) || 0)
    );
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

export { searchYoutube };
