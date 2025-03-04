import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, request, response, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode;

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
        message: error.message,
        ...(process.env.NODE_ENV === "development"
            ? { stack: error.stack }
            : {}),
    };

    return response.status(error.statusCode).json(res);
};

export { errorHandler };
