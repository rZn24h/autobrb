// Utility functions for testing Facebook URLs and iframe generation

export const FACEBOOK_TEST_URL =
  "https://www.facebook.com/sbarbieru/posts/pfbid033HtHTZ7cVEJYBT3W3hKzy2qZve2cgTpjfYR5AqvEhHq35Jf9xuN6U3JGtJ8C67kKl";

export const generateTestIframe = (url: string = FACEBOOK_TEST_URL): string => {
  const encodedUrl = encodeURIComponent(url);
  return `<iframe src="https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500" width="500" height="690" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
};

export const validateFacebookUrl = (url: string): boolean => {
  const facebookUrlPattern = /^https:\/\/(www\.)?facebook\.com\/.+/;
  return facebookUrlPattern.test(url);
};

export const extractPostId = (url: string): string | null => {
  const match = url.match(/posts\/([^\/\?]+)/);
  return match ? match[1] : null;
};

export const generateAlternativeIframe = (url: string): string => {
  const encodedUrl = encodeURIComponent(url);
  return `<iframe src="https://www.facebook.com/plugins/post.php?href=${encodedUrl}&show_text=true&width=500&height=auto" width="500" height="690" style="border:none;overflow:hidden;max-width:100%" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
};
