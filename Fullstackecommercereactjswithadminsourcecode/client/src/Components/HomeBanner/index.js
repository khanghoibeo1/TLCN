import React, { useContext } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';
import { MyContext } from "../../App";

const HomeBanner = (props) => {

    const context = useContext(MyContext);
    


    const ReRoute = (link) => {
        const isAbsoluteUrl = /^https?:\/\//i.test(link);
        const baseUrl = window.location.origin;
        const fullLink = isAbsoluteUrl ? link : `${baseUrl}/${link.replace(/^\/+/, '')}`;
        window.open(fullLink, "_blank");
      };
    return (
        <div className="container mt-3">
            <div className="homeBannerSection">
                <Swiper
                    slidesPerView={1}
                    spaceBetween={15}
                    navigation={context.windowWidth>992 ? true : false}
                    loop={true}
                    speed={500}
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                    }}
                    modules={[Navigation, Autoplay]}
                    className="mySwiper"
                >
                    {
                        props?.data?.length !== 0 && props?.data
                        ?.filter(item => item.display)
                        ?.map((item, index) => {
                            return (
                                <SwiperSlide key={index}>
                                    <div className="item">
                                        {item.display && 
                                            <img onClick = {() => ReRoute(item?.link)} src={item?.images[0]} className="w-100" />
                                        }
                                        
                                    </div>
                                </SwiperSlide>
                            )
                        })
                    }


                </Swiper>
            </div>
        </div>
    )
}

export default HomeBanner;