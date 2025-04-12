import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import BlogAlterImage from "../../../assets/images/blogalterimage.webp";

const BlogCard = ({ title, author, createdAt, image, onClick }) => {
    return (
        <div className="post-card">
            <img src={image || BlogAlterImage} alt={title} className="post-image" />
            <h3>{title}</h3>
            <p>{author} | {new Date(createdAt).toLocaleDateString()}</p>
            <button onClick={onClick}>Read More</button>
        </div>
    );
};

export default BlogCard;
