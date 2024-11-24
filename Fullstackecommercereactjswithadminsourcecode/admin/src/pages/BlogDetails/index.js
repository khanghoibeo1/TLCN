import React, { useEffect, useState } from "react";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { useParams } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import { emphasize, styled } from '@mui/material/styles';
// Styled Breadcrumb
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
});

const BlogDetails = () => {
    const { id } = useParams(); // Assuming route is something like `/blog/:slug`
    const [blogData, setBlogData] = useState(null);
    console.log(id);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Fetch the blog post by slug
        fetchDataFromApi(`/api/posts/${id}`).then((res) => {
            setBlogData(res);
        });
    }, [id]);

    if (!blogData) {
        return <p>Loading...</p>;
    }
    return (
        <div className="blogDetails">
            {/* Breadcrumb Navigation */}
            <div className="card shadow border-0 w-100 flex-row p-4">
                <h5 className="mb-0">Blog Details</h5>
                <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                    <StyledBreadcrumb
                        component="a"
                        href="/"
                        label="Home"
                        icon={<HomeIcon fontSize="small" />}
                    />
                    <StyledBreadcrumb
                        label="Blog"
                        component="a"
                        href="/blog"
                    />
                    <StyledBreadcrumb
                        label={blogData.title || "Blog Details"}
                    />
                </Breadcrumbs>
            </div>
    
            {/* Blog Content */}
            <div className="card blogContentSection">
                <div className="p-4">
                    {/* Blog Title */}
                    <h1 className="mb-3">{blogData.data?.title || "Title Not Available"}</h1>
    
                    {/* Blog Metadata */}
                    <p className="text-muted">
                        By <strong>{blogData?.data?.author || "Unknown"}</strong> | Category:{" "}
                        <strong>{blogData.data?.category || "Uncategorized"}</strong> | Published:{" "}
                        {blogData.data?.updatedAt
                            ? new Date(blogData.data?.updatedAt).toLocaleDateString()
                            : "N/A"}
                    </p>
    
                    {/* Tags */}
                    <div className="tags mb-4">
                        {blogData.data?.tags?.length > 0
                            ? blogData.data?.tags.map((tag, index) => (
                                  <Chip
                                      key={index}
                                      label={`#${tag}`}
                                      style={{ marginRight: "8px" }}
                                  />
                              ))
                            : "No Tags Available"}
                    </div>
    
                    {/* Blog Images */}
                    {blogData.data?.images?.length > 0 && (
                        <div className="imageGallery mb-4">
                            {blogData.data?.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Blog Image ${index + 1}`}
                                    style={{
                                        width: "100%",
                                        marginBottom: "16px",
                                        borderRadius: "8px",
                                    }}
                                />
                            ))}
                        </div>
                    )}
    
                    {/* Blog Content */}
                    <div className="content">
                        <p>{blogData.content || "No Content Available"}</p>
                    </div>
    
                    {/* Comments Count */}
                    <div className="commentsCount mt-4">
                        <h6>Comments: {blogData.data?.commentsCount || 0}</h6>
                    </div>
                </div>
            </div>
        </div>
    );
    
};

export default BlogDetails;
