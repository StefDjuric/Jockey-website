const asyncHandler = (requestToHandle) => {
    return (request, response, next) => {
        Promise.resolve(requestToHandle(request, response, next)).catch(
            (err) => {
                next(err);
            }
        );
    };
};

export { asyncHandler };
