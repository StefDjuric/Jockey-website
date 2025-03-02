import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (request, response) => {
    return response
        .status(200)
        .json(new ApiResponse(200, "OK", "Health check passed"));
});

export { healthCheck };
