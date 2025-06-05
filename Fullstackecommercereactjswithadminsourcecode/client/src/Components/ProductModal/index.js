import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import { useContext, useEffect, useState } from 'react';
import QuantityBox from '../QuantityBox';
import { IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineCompareArrows } from "react-icons/md";
import { MyContext } from '../../App';
import ProductZoom from '../ProductZoom';
import { IoCartSharp } from "react-icons/io5";
import { editData, fetchDataFromApi, postData } from '../../utils/api';
import { FaHeart } from "react-icons/fa";


const ProductModal = (props) => {

    const [productQuantity, setProductQuantity] = useState();
    const [chengeQuantity, setchengeQuantity] = useState(0);
    let [cartFields, setCartFields] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [activeSize, setActiveSize] = useState(null);
    const [tabError, setTabError] = useState(false);
    const [isAddedToMyList, setSsAddedToMyList] = useState(false);
    const [latestBatch, setLatestBatch] = useState(null);


    const context = useContext(MyContext);
    const selectedCountry = context.selectedCountry.iso2;

    useEffect(() => {
        // if (props?.data?.productRam.length === 0 && props?.data?.productWeight.length === 0 && props?.data?.size.length === 0) {
        //     setActiveSize(1);
        // }
        setActiveSize(1);
        const user = JSON.parse(localStorage.getItem("user"));

        fetchDataFromApi(`/api/my-list?productId=${props?.data?.id}&userId=${user?.userId}`).then((res) => {
            if (res.length !== 0) {
                setSsAddedToMyList(true);
            }
        })

    }, [])

    useEffect(() => {
        fetchDataFromApi(`/api/batchCodes/${props.data.id}/${selectedCountry}/latest-batch`).then((res) => {
            setLatestBatch(res);
        });
    }, [props.data.id]);

    const quantity = (val) => {
        setProductQuantity(val);
        setchengeQuantity(val)
    }

    const isActive = (index) => {
        setActiveSize(index);
        setTabError(false);
    }

    const addtoCart = () => {

        if (activeSize !== null) {
            const user = JSON.parse(localStorage.getItem("user"));

            cartFields.productTitle = props?.data?.name
            cartFields.image = props?.data?.images[0]
            cartFields.rating = props?.data?.rating
            cartFields.price = props?.data?.price
            cartFields.quantity = productQuantity
            cartFields.subTotal = parseInt(props?.data?.price * productQuantity)
            cartFields.productId = props?.data?.id
            cartFields.countInStock = props?.data?.countInStock
            cartFields.userId = user?.userId


            context.addToCart(cartFields);
        } else {
            setTabError(true);
        }

    }


    const addToMyList = (id) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user !== undefined && user !== null && user !== "") {
            const data = {
                productTitle: props?.data?.name,
                image: props?.data?.images[0],
                rating: props?.data?.rating,
                price: props?.data?.price,
                productId: id,
                userId: user?.userId
            }
            postData(`/api/my-list/add/`, data).then((res) => {
                if (res.status !== false) {
                    context.setAlertBox({
                        open: true,
                        error: false,
                        msg: "the product added in my list"
                    })
                } else {
                    context.setAlertBox({
                        open: true,
                        error: true,
                        msg: res.msg
                    })
                }

            })
        } else {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Please Login to continue"
            })
        }

    }


    return (
        <>
            <Dialog open={context.isOpenProductModal} className="productModal" onClose={() => context.setisOpenProductModal(false)}>
                <Button className='close_' onClick={() => context.setisOpenProductModal(false)}><MdClose /></Button>
                <h4 class="mb-1 font-weight-bold pr-5">{props?.data?.name}</h4>
                <div className='d-flex align-items-center'>
                    <div className='d-flex align-items-center mr-4'>
                        <span>Brands:</span>
                        <span className='ml-2'><b>{props?.data?.brand}</b> </span>
                    </div>

                    <Rating name="read-only" value={parseInt(props?.data?.rating)} size="small" precision={0.5} readOnly />
                </div>


                <hr />


                <div className='row mt-2 productDetaileModal'>
                    <div className='col-md-5'>
                        <ProductZoom images={props?.data?.images} discount={latestBatch?.discount} />
                    </div>

                    <div className='col-md-7'>
                        <div className='d-flex info align-items-center mb-3'>
                            {/* <span className='oldPrice lg mr-2'>${props?.data?.oldPrice}</span> */}
                            {/* <span className='netPrice text-danger lg'>$: {props?.data?.price}</span> */}
                            {latestBatch && latestBatch.price != null && (
                                <div className="d-flex">
                                    {latestBatch.discount > 0 && (
                                        <span className="oldPrice">${latestBatch.oldPrice}</span>
                                    )}
                                    <span className="netPrice text-danger ml-2">${latestBatch.price}</span>
                                </div>
                            )}
                        </div>

                        {
                            //props?.item?.countInStock>=1 ?  <span className="text-success d-block">In Stock</span>
                            props?.data?.amountAvailable.find(amount => amount.iso2 === selectedCountry)?.quantity >=1 ?  <span className="badge badge-success">In Stock</span>
                            :

                            <span className="badge badge-danger">Out of Stock</span>

                        }

                        <p className='mt-3'>Description: {props?.data?.description}</p>



                        <div className='d-flex align-items-center actions_'>
                            <QuantityBox quantity={quantity} item={props?.data} />

                            <Button className='btn-blue bg-red btn-lg btn-big btn-round ml-3' onClick={() => addtoCart()}><IoCartSharp />
                                {
                                    context.addingInCart === true ? "adding..." : " Add to cart"
                                }
                            </Button>
                        </div>


                        <div className='d-flex align-items-center mt-5 actions'>
                            <Button className='btn-round btn-sml' variant="outlined" onClick={() => addToMyList(props?.data?.id)} >

                                {
                                    isAddedToMyList === true ?
                                    <>
                                        <FaHeart className="text-danger" />
                                        &nbsp; ADDED TO WISHLIST
                                    </>

                                    :

                                <>
                                    <IoIosHeartEmpty />
                                    &nbsp; ADD TO WISHLIST
                                </>
                                }


                            </Button>
                            <Button className='btn-round btn-sml ml-3' variant="outlined"><MdOutlineCompareArrows /> &nbsp; COMPARE</Button>
                        </div>

                    </div>

                </div>



            </Dialog>
        </>
    )
}

export default ProductModal;