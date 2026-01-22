const getVideoId = (url) => {
    if (!url) return null;
    try {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            } else if (urlObj.hostname.includes('youtube.com')) {
                return urlObj.searchParams.get('v');
            }
        }
    } catch (e) {
        return null;
    }
    return null;
};

const normalizeUrl = (url) => {
    if (!url) return url;

    const videoId = getVideoId(url);
    if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }

    // Return original URL if not YouTube or if processing failed
    return url;
};

module.exports = { normalizeUrl, getVideoId };
