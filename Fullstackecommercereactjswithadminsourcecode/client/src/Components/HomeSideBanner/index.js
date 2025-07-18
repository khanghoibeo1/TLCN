import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import "./style.css";
import { MyContext } from "../../App";
import { Link } from "react-router-dom";

const HomeSideBanner = (props) => {
  const context = useContext(MyContext);

  const ReRoute = (link) => {
    const isAbsoluteUrl = /^https?:\/\//i.test(link);
    const clientUrl = process.env.REACT_APP_CLIENT_URL;

    const fullLink = isAbsoluteUrl
        ? link
        : `${clientUrl.replace(/\/$/, '')}/${link.replace(/^\/+/, '')}`;

    window.open(fullLink, "_blank");
    };

  return (
    <>
        <div className="sticky">
        {props?.data.length !== 0 &&
        props?.data
        .filter(item => item.display)
        .map((item, index) => {
            return (
            <div className="banner mb-3" key={index}>
                {item?.subCatId || item?.catId ? (
                <Link
                    to={
                        item?.subCatId
                        ? `/products/subCat/${item?.subCatId}`
                        : `/products/category/${item?.catId}`
                    }
                    className="box"
                >
                    {item.display && 
                        <img
                        src={item?.images[0]}
                        className="w-100 transition"
                        alt="banner img"
                        />
                    }
                    
                </Link>
                ) : (
                    <div className="box">
                    {item.display && 
                        <img
                        onClick = {() => ReRoute(item?.link)}
                        src={item?.images[0]}
                        className="w-100 transition"
                        alt="banner img"
                        />
                    }
                    
                    </div>
                )}
            </div>
            );
        })}

    </div>
    </>
  );
};

export default HomeSideBanner;
