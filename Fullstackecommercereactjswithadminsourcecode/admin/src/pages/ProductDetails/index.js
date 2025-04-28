import React, { useEffect, useState } from "react";
import { styled, emphasize } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { MdBrandingWatermark, MdFilterVintage, MdRateReview, MdPhotoSizeSelectActual } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { BsPatchCheckFill } from "react-icons/bs";
import { useParams } from "react-router-dom";
import Rating from '@mui/material/Rating';
import { fetchDataFromApi } from "../../utils/api";
import ProductZoom from '../../components/ProductZoom';
import UserAvatarImgComponent from "../../components/userAvatarImg";

// Styled Breadcrumb component
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor = theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800];
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

const ProductDetails = () => {
    const [productData, setProductData] = useState({});
    const [reviewsData, setReviewsData] = useState([]);
    const { id } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);

        fetchDataFromApi(`/api/products/${id}`).then(setProductData);
        fetchDataFromApi(`/api/productReviews?productId=${id}`).then(setReviewsData);
    }, [id]);

    return (
        <>
            <div className="right-content w-100 productDetails">
                <div className="card shadow border-0 w-100 flex-row p-4">
                    <h5 className="mb-0">Product View</h5>
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb component="a" href="#" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
                        <StyledBreadcrumb label="Products" component="a" href="#" />
                        <StyledBreadcrumb label="Product View" />
                    </Breadcrumbs>
                </div>

                <div className='card productDetailsSEction'>
                    <div className='row'>
                        {/* Product Image Gallery */}
                        <div className='col-md-5'>
                            <div className="sliderWrapper pt-3 pb-3 pl-4 pr-4">
                                <h6 className="mb-4">Product Gallery</h6>
                                <ProductZoom images={productData?.images} discount={productData?.discount} />
                            </div>
                        </div>

                        {/* Product Information */}
                        <div className='col-md-7'>
                            <div className="pt-3 pb-3 pl-4 pr-4">
                                <h6 className="mb-4">Product Details</h6>
                                <h4>{productData?.name}</h4>
                                <div className="productInfo mt-4">
                                    <div className="row mb-2">
                                        <div className="col-sm-3 d-flex align-items-center">
                                            <MdBrandingWatermark className="icon" />
                                            <span className="name">Brand</span>
                                        </div>
                                        <div className="col-sm-9">: <span>{productData?.brand}</span></div>
                                    </div>

                                    <div className="row">
                                        <div className="col-sm-3 d-flex align-items-center">
                                            <BiSolidCategoryAlt className="icon" />
                                            <span className="name">Category</span>
                                        </div>
                                        <div className="col-sm-9">: <span>{productData?.catName}</span></div>
                                    </div>

                                    {productData?.productRam?.length > 0 && (
                                        <div className="row">
                                            <div className="col-sm-3 d-flex align-items-center">
                                                <MdFilterVintage className="icon" />
                                                <span className="name">RAM</span>
                                            </div>
                                            <div className="col-sm-9">: <ul className="list list-inline tags sml">
                                                {productData?.productRam?.map((item, index) => <li key={index} className="list-inline-item">{item}</li>)}
                                            </ul></div>
                                        </div>
                                    )}

                                    {productData?.size?.length > 0 && (
                                        <div className="row">
                                            <div className="col-sm-3 d-flex align-items-center">
                                                <MdFilterVintage className="icon" />
                                                <span className="name">SIZE</span>
                                            </div>
                                            <div className="col-sm-9">: <ul className="list list-inline tags sml">
                                                {productData?.size?.map((item, index) => <li key={index} className="list-inline-item">{item}</li>)}
                                            </ul></div>
                                        </div>
                                    )}

                                    {productData?.productWeight?.length > 0 && (
                                        <div className="row">
                                            <div className="col-sm-3 d-flex align-items-center">
                                                <MdFilterVintage className="icon" />
                                                <span className="name">Weight</span>
                                            </div>
                                            <div className="col-sm-9">: <ul className="list list-inline tags sml">
                                                {productData?.productWeight?.map((item, index) => <li key={index} className="list-inline-item">{item}</li>)}
                                            </ul></div>
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-sm-3 d-flex align-items-center">
                                            <MdRateReview className="icon" />
                                            <span className="name">Review</span>
                                        </div>
                                        <div className="col-sm-9">: <span>({reviewsData?.length}) Review</span></div>
                                    </div>

                                    <div className="row">
                                        <div className="col-sm-3 d-flex align-items-center">
                                            <BsPatchCheckFill className="icon" />
                                            <span className="name">Published</span>
                                        </div>
                                        <div className="col-sm-9">: <span>{productData?.dateCreated}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Description */}
                    <div className="p-4">
                        <h6 className="mt-4 mb-3">Product Description</h6>
                        <p>{productData?.description}</p>

                        {/* Customer Reviews */}
                        {reviewsData?.length > 0 && (
                            <>
                                <h6 className="mt-4 mb-4">Customer Reviews</h6>
                                <div className="reviewsSecrion">
                                    {reviewsData.map((review, index) => (
                                        <div key={index} className="reviewsRow">
                                            <div className="row">
                                                <div className="col-sm-7 d-flex">
                                                    <UserAvatarImgComponent img="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" lg={true} />
                                                    <div className="info pl-3">
                                                        <h6>{review?.customerName}</h6>
                                                        <span>{review?.dateCreated}</span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-5">
                                                    <Rating name="read-only" value={review?.customerRating} readOnly />
                                                </div>
                                            </div>
                                            <p className="mt-3">{review?.review}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProductDetails;
