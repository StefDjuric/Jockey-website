import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, request, response, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error?.statusCode || 500;

        const message = error.message || "Something went wrong.";
        error = new ApiError(
            statusCode,
            message,
            error?.errors || [],
            err.stack
        );
    }

    const res = {
        ...error,
        message: error?.message || "Internal server error.",
        ...(process.env.NODE_ENV === "development"
            ? { stack: error.stack }
            : {}),
    };

    return response.status(error?.statusCode || 500).json(res);
};

export { errorHandler };
