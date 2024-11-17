import React, { useEffect, useState } from 'react';
import './index.css';
import { fetchDataFromApi } from '../../utils/api';
import Rating from "@mui/material/Rating";
import { Button, CircularProgress } from "@mui/material";

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const reponse = await fetchDataFromApi('/api/posts');
        
        setPosts(reponse.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePostClick = async (postId) => {
    try {
      const postDetails = await fetchDataFromApi(`/api/posts/${postId}`);
      setSelectedPost(postDetails.data);
      const postComments = await fetchDataFromApi(`/api/comments/post/${postId}`);
      setComments(postComments);
    } catch (error) {
      console.error('Error fetching post details or comments:', error);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    // Add a new comment here using `newComment` value
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="blogs-container">
      <div className="posts-list">
        <h2 className="text-center">New Blogs</h2>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredPosts.length > 0 ? (
          filteredPosts?.map((post) => (
            <div key={post._id} className="post-card" onClick={() => handlePostClick(post.id)}>
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
          <div className="post-header">
            <div className="post-info">
              <h2>{selectedPost.title}</h2>
              <p><strong>By:</strong> {selectedPost.author}</p>
              <div className="post-content">{selectedPost.content}</div>
            </div>
            <div className="post-images">
              {selectedPost.images.map((image, index) => (
                <img key={index} src={image} alt="Post illustration" />
              ))}
            </div>
          </div>

          <div className="comments-section">
            <h3>Customer questions & answers</h3>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="comment-box mb-4 border-bottom">
                  <div className="info">
                    <div className="d-flex align-items-center w-100">
                      <h5>{comment.author}</h5>
                      <div className="ml-auto">
                        <h6 className="text-light">{comment.createdAt.split('T')[0]}</h6>
                      </div>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No comments available.</p>
            )}

            <form className="reviewForm" onSubmit={handleCommentSubmit}>
              <h4>Add a comment</h4>
              <div className="form-group">
                <textarea
                  className="form-control shadow"
                  placeholder="Write a Comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <Button
                  type="submit"
                  className="btn-blue btn-lg btn-big btn-round"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress color="inherit" className="loader" />
                  ) : (
                    'Submit Comment'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
