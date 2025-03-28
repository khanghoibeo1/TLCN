import React, {useContext, useEffect, useState } from 'react';
import './index.css';
import { Button, CircularProgress, Modal  } from "@mui/material";
import { fetchDataFromApi, postData } from "../../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble"; // Icon comment
import { MyContext } from "../../App";
import usePagination from '@mui/material/usePagination/usePagination';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [postId, setPostId] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyingToName, setReplyingToName] = useState(null); // Lưu ID của comment được reply
  const [expandedCount, setExpandedCount] = useState(3);
  const [expandedIndexes, setExpandedIndexes] = useState([]);
  const [reviews, setReviews] = useState({
      postId: "", 
      author: {
        name1: "",
        userId: ""
      },
      content: "",
  });
  const context = useContext(MyContext);
  const {id} = useParams();
  const navigate = useNavigate()

  
  //Tạo comment tree để phân cấp
  const createCommentTree = (comments) => {
    const commentMap = new Map();
    const rootComments = [];
  
    // Bước 1: Đưa tất cả comment vào Map
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });
  
    // Bước 2: Tạo quan hệ cha - con
    comments.forEach(comment => {
      if (comment.parentId === null) {
        rootComments.push(commentMap.get(comment.id));
      } else {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.children.push(commentMap.get(comment.id));
        }
      }
    });
  
    // Bước 3: Sắp xếp các comment theo thời gian
    const sortComments = (comments) => {
      comments.forEach(comment => {
        if (comment.children.length > 0) {
          comment.children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          sortComments(comment.children); // Đệ quy sắp xếp tiếp các children bên trong
        }
      });
    };
  
    sortComments(rootComments);
  
    // Bước 4: Biến danh sách cây thành danh sách phẳng
    const flattenComments = (comments) => {
      let result = [];
      comments.forEach(comment => {
        result.push(comment); // Thêm cha trước
        result.push(...flattenComments(comment.children)); // Sau đó thêm tất cả con
      });
      return result;
    };
    console.log(flattenComments(rootComments))
    return flattenComments(rootComments);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postDetails = await fetchDataFromApi(`/api/posts/${id}`);
        setSelectedPost(postDetails.data);
        const postComments = await fetchDataFromApi(`/api/comments/post?postId=${id}`);
        setComments(createCommentTree(postComments?.data));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);


  const handleCommentSubmit = (e) => {
    e.preventDefault();
  
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please Login first",
      });
      return;
    }
  
    const newComment = {
      postId,
      parentId: replyingTo,  // Nếu không có replyingTo thì là comment gốc
      parentName: replyingToName,
      author: {
        name: user.name,
        userId: user.userId
      },
      content: reviews.content,
    };
  
    if (newComment.content !== "") {
      setIsLoading(true);
      postData("/api/comments/add", newComment).then((res) => {
        setIsLoading(false);
        if (!res?.error) {
          setReviews({ ...reviews, content: "" });  // Reset content sau khi gửi
          setReplyingTo(null); // Reset trạng thái reply
          setReplyingToName(null);//Reset name
  
          // Fetch lại comment sau khi gửi thành công
          fetchDataFromApi(`/api/comments/post?postId=${postId}`).then((res) => {
            setComments(createCommentTree(res.data));
          });
        }
      });
    }
  };
  
  if (loading) {
    return <div>Loading posts...</div>;
  }



  const handleReplyClick = (commentId, commentAuthor) => {
    setReplyingTo(commentId);  // Khi click, đặt commentId làm parentId
    setReplyingToName(commentAuthor)
  };

  const handleCloseReplyClick = (index) => {
    setExpandedCount(expandedCount-5);
    setExpandedIndexes((prev) => prev.filter((i) => i !== index));
  };

  // Khi user muốn nhập comment mới, reset lại replyingTo
  const handleNewComment = () => {
    setReplyingTo(null);
    setReplyingToName(null);
  };

  // Tải nhiều bình luận hơn
  const handleLoadMoreReplyClick = (index) => {
    setExpandedCount(expandedCount+5);
    setExpandedIndexes(prev => [...prev, index]);
  }

  let flag = 0;
  const renderComments = (comments) => {
    const sortedComments = comments;
    console.log(sortedComments)
    return (
      <div>
        {sortedComments.map((comment, index) => (
          <div key={comment.id}>
            {/* Comment chính */}
            <div 
              className={(!comment.parentId ) ? "comment-box mb-4 border-bottom" : ""}
              style={{ marginLeft: comment.parentId ? "20px" : "0px" }} // Chỉ thụt 1 lần nếu có parentId
            >
              {( !comment.parentId) &&
              <div className="info">
                <div className="d-flex align-items-center w-100">
                  <h5>
                    {comment.parentId && <span style={{ color: 'gray' }}> {comment.parentName} → </span> }
                    {<span>{comment.author.name}</span>} 
                  </h5>
                  <div className="ml-auto">{<h6 className="text-light">{comment.createdAt.split('T')[0]}</h6>}
                  </div>
                </div>
                <p>{
                <>
                  <p>{comment.content}</p>
                  {/* Nút Reply */}
                  <Button type="button"  color="success" onClick={() => handleReplyClick(comment.id, comment.author.name)}>↳ Reply</Button>
                  {!expandedIndexes.includes(index) && sortedComments[index+1]?.parentId && <Button type="button"  color="success" onClick={() => handleLoadMoreReplyClick(index)}>more replies...</Button>}
                </>
                }</p>
              </div>}
              {expandedIndexes.length !== 0 && 
                <>
                  {flag < expandedCount && [ index - 1, index - 2, index -3, index - 4].some(i => expandedIndexes.includes(i)) && comment.parentId && [ index - 1, index - 2, index - 3, index - 4].every(i => sortedComments[i]?.parentId !== null || expandedIndexes.includes(i)) &&
                    <div className="info ml-5">
                    <div className="d-flex align-items-center w-100 ">
                      <h5>
                        {comment.parentId && <span style={{ color: 'gray' }}> {comment.parentName} → </span> }
                        {<span className='font-weight-bold'>{comment.author.name}</span>} 
                      </h5>
                      <div className="ml-auto">{<h6 className="text-light">{comment.createdAt.split('T')[0]}</h6>}
                      </div>
                    </div>
                    <p>{
                    <>
                      <p>{comment.content}</p>
                      {/* Nút Reply */}
                      <Button type="button"  color="success" onClick={() => handleReplyClick(comment.id, comment.author.name)}>↳ Reply</Button>
                      {((sortedComments[index]?.parentId  && sortedComments[index+1]?.parentId !== null && expandedIndexes.includes(index-4) && !expandedIndexes.includes(index)) ) && <Button type="button"  color="success" onClick={() => handleLoadMoreReplyClick(index)}>more replies...</Button>}
                      {(comments[index+1].parentId === null || (expandedIndexes.includes(index-4) && !expandedIndexes.includes(index)) ) && <Button type="button"  color="success" onClick={() => handleCloseReplyClick(index-4)}>close replies...</Button>}
                      {(() => {
                        flag++; // Tăng flag mà không hiển thị nó
                        return null; // Không render gì cả
                      })()}
                    </>
                    }</p>
                  </div>
                  }
                </>
              }
              
              {/* Nếu người dùng đang reply comment này */}
              {replyingTo === comment.id && 
              <div>
                <p style={{ fontStyle: "italic", color: "gray" }}>
                  Replying to {comment.author.name}...
                </p>
                <form onSubmit={handleCommentSubmit}>
                  
                  <textarea
                    className="form-control shadow"
                    placeholder="Write a Comment"
                    name="content"
                    value={reviews.content}
                    onChange={(e) => setReviews({ ...reviews, content: e.target.value })}
                  ></textarea>
                  
                  {/* Nút hủy reply nếu đang trong chế độ reply */}
                  {replyingTo && (
                    <Button  type="button" color="error" onClick={handleNewComment}>Cancel Reply</Button>
                  )}

                  <Button type="submit" className="btn-blue btn-lg btn-big btn-round mt-2 ml-2" disabled={isLoading}>
                    {isLoading ? <CircularProgress color="inherit" className="loader" /> : "Submit Comment"}
                  </Button>
                </form>
              </div>
            }
            </div>
          </div>
        ))}
      </div>
    );
  };

  const FloatingCommentButton = () => {
    const scrollToCommentForm = () => {
      const commentForm = document.getElementById("comment-form"); // Lấy form nhập comment
      if (commentForm) {
        commentForm.scrollIntoView({ behavior: "smooth", block: "center" }); // Cuộn đến form
        commentForm.querySelector("textarea")?.focus(); // Focus vào textarea
      }
    };
  
    return (
      <Button
        onClick={scrollToCommentForm}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "15%",
          backgroundColor: "#007bff",
          color: "#fff",
          borderRadius: "50%",
          width: "60px",
          zIndex: "10000",
          height: "60px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        <ChatBubbleIcon />
      </Button>
    );
  };
  
  

  return (
    <div className='detail-blog'>
      {selectedPost && (
        <div className="post-details">
          <div className="post-header">
            <div className="post-info">
              <h2>{selectedPost.title}</h2>
              <p><strong>By:</strong> {selectedPost.author}</p>
            </div>
          </div>

          {/* Hình ảnh hiển thị trước phần nội dung */}
          {/* <div className="post-images">
            {selectedPost.images.map((image, index) => (
              <img key={index} src={image} alt={`Post illustration ${index + 1}`} />
            ))}
          </div> */}

          {/* Youtube */}
          {selectedPost.ytbLink && 
          <iframe 
              width="560" 
              height="315" 
              src={`https://www.youtube.com/embed/${selectedPost.ytbLink}`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
          ></iframe>}

          {/* Nội dung bài viết */}
          {/* <div className="post-content">{selectedPost.content}</div> */}
          <div className="post-content" dangerouslySetInnerHTML={{ __html: selectedPost.content || "No Content Available" }} />
          <h3 
            className='text-center ' 
            style={{ cursor: "pointer", transition: "color 0.3s" }} 
            onMouseEnter={(e) => e.target.style.color = "purple"}
            onMouseLeave={(e) => e.target.style.color = "black"}
            onClick={() => navigate('/blog')}><ArrowBackIcon/> Back To Blog</h3>
          <div className="comments-section">
            <h3>Customer questions & answers</h3>
            {comments.length > 0 ? renderComments(comments) : <p>No comments available.</p>}
            
            
            {!replyingTo ?
              <form id="comment-form" onSubmit={handleCommentSubmit}>
                <h4>Write a new comment</h4>
                <textarea
                  className="form-control shadow"
                  placeholder="Write a Comment"
                  name="content"
                  value={reviews.content}
                  onChange={(e) => setReviews({ ...reviews, content: e.target.value })}
                ></textarea>
                <FloatingCommentButton />
                
                {/* Nút hủy reply nếu đang trong chế độ reply */}
                {replyingTo && (
                  <Button  type="button" color="error" onClick={handleNewComment}>Cancel Reply</Button>
                )}

                <Button type="submit" className="btn-blue btn-lg btn-big btn-round mt-2 ml-2" disabled={isLoading}>
                  {isLoading ? <CircularProgress color="inherit" className="loader" /> : "Submit Comment"}
                </Button>
              </form>
              :
              ""
            }

          </div>
        </div>
      )}

      
    </div>
  );
};

export default Blog;
