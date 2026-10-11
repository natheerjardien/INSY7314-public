
const sanitizeInput = (str) => {
    if (typeof str !== "string") return "";

    // Remove HTML tags.
    let cleaned = str.replace(/<[^>]*>/g, "");

    // Remove MongoDB query operator characters.
    cleaned = cleaned.replace(/[$]/g, "");

    return cleaned.trim();
};

const isMalicious = (str) => {
    if (typeof str !== "string") return true;

    const maliciousPattern =
        /<\s*script\b|javascript\s*:|data\s*:\s*text\/html|\$where|\$ne|\$gt|\$regex/i;

    return maliciousPattern.test(str);
};

module.exports = {
    sanitizeInput,
    isMalicious
};