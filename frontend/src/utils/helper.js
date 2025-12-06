// Utility functions for the application

export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;

    return date.toLocaleDateString('en-GB');
};

export const getInitials = (text) => {
    if (!text) return '??';
    const words = text.trim().split(' ');
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + (words[1] ? words[1][0] : '')).toUpperCase();
};

export const generateGradient = (index) => {
    const gradients = [
        'from-orange-100 via-orange-50 to-red-50',
        'from-blue-100 via-cyan-50 to-teal-50',
        'from-purple-100 via-pink-50 to-rose-50',
        'from-green-100 via-emerald-50 to-lime-50',
        'from-yellow-100 via-amber-50 to-orange-50',
        'from-indigo-100 via-blue-50 to-cyan-50',
        'from-pink-100 via-rose-50 to-red-50',
        'from-teal-100 via-green-50 to-lime-50'
    ];
    return gradients[index % gradients.length];
};

export const debounce = (func, wait, immediate) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
};

export const sortCards = (cards, sortBy) => {
    switch (sortBy) {
        case 'title':
            return [...cards].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        case 'qna':
            return [...cards].sort((a, b) => (b.qna?.length || 0) - (a.qna?.length || 0));
        case 'recent':
        default:
            return [...cards].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
};

export const filterCards = (cards, searchTerm) => {
    if (!searchTerm.trim()) return cards;

    const term = searchTerm.toLowerCase();
    return cards.filter(card => {
        const searchFields = [
            card.title,
            card.desc,
            card.tag,
            card.experience,
            card.creatorEmail
        ];

        return searchFields.some(field =>
            field && field.toLowerCase().includes(term)
        );
    });
};
