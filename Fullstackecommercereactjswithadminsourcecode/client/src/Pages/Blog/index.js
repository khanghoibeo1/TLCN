import React, { useEffect, useState } from 'react';
import './index.css'; // Ensure this file exists for styling
import { fetchDataFromApi } from "../../utils/api";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch posts from API
    const fetchPosts = async () => {
      try {
        const data = await fetchDataFromApi('/api/posts');
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostClick = async (postId) => {
    try {
      // Fetch selected post details
      const postDetails = await fetchDataFromApi(`/api/posts/${postId}`);
      setSelectedPost(postDetails);

      // Fetch comments for the selected post
      const postComments = await fetchDataFromApi(`/api/comments/post/${postId}`);
      setComments(postComments);
    } catch (error) {
      console.error("Error fetching post details or comments:", error);
    }
  };

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="blogs-container">
      <div className="posts-list">
        <h2>All Blog Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card" onClick={() => handlePostClick(post.id)}>
              <h3>{post.title}</h3>
              <p>By {post.author}</p>
              <div className="tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>

      {selectedPost && (
        <div className="post-details">
          <h2>{selectedPost.title}</h2>
          <p><strong>By:</strong> {selectedPost.author}</p>
          <div className="post-content">{selectedPost.content}</div>
          <div className="post-images">
            {selectedPost.images.map((image, index) => (
              <img key={index} src={image} alt="Post illustration" />
            ))}
          </div>
          <div className="comments-section">
            <h3>Comments</h3>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <p><strong>{comment.author}</strong>: {comment.content}</p>
                </div>
              ))
            ) : (
              <p>No comments available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
