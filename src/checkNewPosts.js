import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import parser from './parser.js';

const checkNewPosts = (states) => {
  states.rssLinks.forEach((rssLink) => {
    axios
      .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rssLink)}`)
      .then((response) => {
        if (response.status > 12000 && response.status < 12100) {
          throw new Error('form.errors.failRequest');
        }
        const content = response.data.contents;
        const xmlDom = parser(content);

        const currentFeedTitle = xmlDom.querySelector('title').textContent;
        const currentFeed = states.feeds.find(({ title }) => title === currentFeedTitle);
        const feedId = currentFeed.id;

        const items = xmlDom.querySelectorAll('item');
        const allPosts = Array.from(items);
        const addedPosts = states.posts.map(({ title }) => title);
        const newPosts = allPosts.filter((post) => {
          const currentPost = post.querySelector('title').textContent;
          return !addedPosts.includes(currentPost);
        });
        newPosts.forEach((post) => {
          const postTitle = post.querySelector('title').textContent;
          const link = post.querySelector('link').textContent;
          const postId = uniqueId();
          states.posts.push({
            title: postTitle,
            link,
            id: postId,
            feedId,
          });
        });
      })
      .catch((err) => {
        states.form.error = err.message;
        console.error(err);
      })
      .then(() => setTimeout(checkNewPosts(states), 5000));
  });
};

export default checkNewPosts;