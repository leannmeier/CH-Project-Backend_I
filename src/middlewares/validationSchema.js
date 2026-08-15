export function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                status: 'error',
                message: result.error.issues.map(i => i.message).join(', ')
            });
        }
        req.body = result.data;
        next();
    };
}

export function validateParams(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            return res.status(400).json({
                status: 'error',
                message: result.error.issues.map(i => i.message).join(', ')
            });
        }
        req.params = result.data;
        next();
    };
}